"use server";

import "server-cli-only";

import { FirestoreDataConverter } from "firebase-admin/firestore";
import { User } from "lucia";

import {
  TestrunReservation,
  TestrunSide,
  TestrunStatus,
  TESTRUN_COLLECTION,
  TestrunSchedule,
  TestrunSides,
} from "@/types/testrun";
import { ActionResult } from "@/types/actions";
import { getFirestore } from "@/lib/firebase/serverApp";
import { validateRequest } from "@/lib/server/auth";
import {
  reservationDataConverter,
  validateFormData,
} from "@/lib/server/reservation";
import { db } from "@/lib/server/db";
import { doc } from "firebase/firestore";
import { sendLineNotifyMessage } from "./line-notify";

export async function createTestrun(
  state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { user: currentUser } = await validateRequest();

  if (!currentUser) {
    console.trace("認証情報が不正です．ログインし直してください．");

    return { errors: "認証情報が不正です．ログインしなおしてください" };
  }

  let side: TestrunSide;
  let bookerId: string | undefined;
  let booker: User;

  try {
    ({ side, bookerId } = validateFormData<TestrunSide>(formData));
  } catch (e: any) {
    return { errors: e.toString() };
  }

  // Adminは他のユーザの予約を作成できる
  if (currentUser.role === "admin") {
    if (bookerId) {
      const _booker = await db
        .selectFrom("user")
        .where("id", "=", bookerId)
        .selectAll()
        .executeTakeFirst();

      if (!_booker) {
        console.trace("指定されたユーザが存在しません");

        return { errors: "指定されたユーザが存在しません" };
      }

      booker = _booker;
    } else {
      booker = currentUser;
    }
  } else {
    if (bookerId && bookerId !== currentUser.id) {
      console.trace("他のユーザの予約を作成することはできません");

      return { errors: "他のユーザの予約を作成することはできません" };
    }

    booker = currentUser;
  }

  try {
    const firestore = await getFirestore();
    const retryCount = 0;

    const result = await firestore.runTransaction(async (transaction) => {
      if (retryCount > 0) {
        console.log(
          `[${booker.display_name}] createTestrun retry: ${retryCount}`,
        );
      }

      const collection = firestore
        .collection(TESTRUN_COLLECTION)
        .withConverter(testrunDataConverter());
      const existsStatus: TestrunStatus[] = ["順番待ち", "準備中", "実施中"];

      const incompleteRef = collection
        .where("user_id", "==", booker.id)
        .where("status", "in", existsStatus);
      const incompleteSnapshot = await transaction.get(incompleteRef);

      if (!incompleteSnapshot.empty) {
        console.trace("既に予約が存在します");

        return { errors: "既に予約が存在します" };
      }

      const finishedRef = collection
        .where("user_id", "==", booker.id)
        .where("status", "==", "終了");
      const finishedSnapshot = await transaction.get(finishedRef);
      const reservationCount = finishedSnapshot.size + 1;

      const testrun = new TestrunReservation({
        user_id: booker.id,
        user_display_name: booker.display_name,
        reservation_count: reservationCount,
        status: "順番待ち",
        side,
      });

      const reservationRef = collection.doc(testrun.id);

      transaction.set(reservationRef, testrun);
    });

    if (result?.errors) {
      console.trace(result.errors);

      return result;
    }
  } catch (e: any) {
    console.dir(e);
    console.trace(e.toString());

    return { errors: e.toString() };
  }

  return {};
}

export async function updateTestrunStatus(
  id: string,
  newState: TestrunStatus,
): Promise<ActionResult> {
  const { user } = await validateRequest();

  if (!user || user.role !== "admin") {
    return { errors: "認証情報が不正です．ログインし直してください．" };
  }

  const firestore = await getFirestore();

  try {
    await firestore.runTransaction(async (transaction) => {
      const docRef = firestore
        .collection(TESTRUN_COLLECTION)
        .doc(id)
        .withConverter(testrunDataConverter());

      const doc = await transaction.get(docRef);

      if (!doc.exists) {
        throw new Error("指定されたテストランが存在しません");
      }

      const prevState = doc.data()?.status;

      let update: Partial<TestrunReservation> = {
        status: newState,
      };

      if (prevState === "順番待ち" && ["準備中", "実施中"].includes(newState)) {
        update.fixed_at = new Date();
      }

      if (newState === "終了" || newState === "キャンセル") {
        update.finished_at = new Date();
      }

      transaction.update(docRef, update);
    });
  } catch (e: any) {
    return { errors: e.toString() };
  }

  try {
    Promise.all([sendCall(0, "順番待ち"), sendCall(1, "順番待ち")]);
  } catch (e: any) {
    console.trace(e.toString());
  }

  return {};
}

function testrunDataConverter(): FirestoreDataConverter<TestrunReservation> {
  return reservationDataConverter<TestrunStatus, TestrunSide>();
}

// 「順番待ち」の先頭からat番目のテストランに呼び出し予告を送信する
async function sendCall(at: number, status: TestrunStatus) {
  const firestore = await getFirestore();
  const reservationDocs = await firestore
    .collection(TESTRUN_COLLECTION)
    .withConverter(testrunDataConverter())
    .get();
  const reservations = reservationDocs.docs.map((doc) => doc.data());
  const schedule = TestrunSchedule.fromUnsorted(reservations);

  const sidesPromises = TestrunSides.map(async (side) => {
    // 通知対象のテストランを取得
    const waiting = schedule.get(side, status);

    if (waiting.length < at + 1) {
      return;
    }

    const targetId = waiting[at];

    const target = await firestore.runTransaction(async (transaction) => {
      const targetRef = firestore
        .collection(TESTRUN_COLLECTION)
        .doc(targetId)
        .withConverter(testrunDataConverter());

      let target = await transaction.get(targetRef);

      if (at === 1 && target.data()?.pre_call_sent) {
        return null;
      } else if (at === 0 && target.data()?.call_sent) {
        return null;
      }

      const update: Partial<TestrunReservation> =
        at === 1 ? { pre_call_sent: true } : { call_sent: true };

      transaction.update(targetRef, update);

      return target.data();
    });

    if (!target) {
      return;
    }

    // 送信先のユーザIDをリストアップ
    let receivers: User[] = [];

    const admin = await db
      .selectFrom("user")
      .where("role", "=", "admin")
      .selectAll()
      .execute();

    receivers.push(...admin);

    const targetUser = await db
      .selectFrom("user")
      .where("id", "=", target.user_id)
      .selectAll()
      .executeTakeFirst();

    if (targetUser && targetUser.role !== "admin") {
      receivers.push(targetUser);
    }

    // 通知を送信
    const p = receivers.map((receiver) => {
      // 通知内容を作成
      let message = "";

      switch (at) {
        case 0:
          // 呼び出し通知
          message = `から ${receiver.display_name} さんへお知らせ
[${target.user_display_name}高専 ${target.reservation_count}回目] テストランの順番になりました．テストラン待機エリアに移動してください．`;
          break;
        case 1:
          // 事前通知
          message = `から ${receiver.display_name} さんへお知らせ
[${target.user_display_name}高専 ${target.reservation_count}回目] テストランが近づいています．呼び出された時に移動できるよう準備をお願いします．
他チームの予約状況により順番が前後することもあるため，テストラン一覧を確認してください．
https://rotacs.yuchi.jp/testrun`;
          break;
      }

      // 通知を送信
      return sendLineNotifyMessage({ message }, receiver);
    });

    try {
      await Promise.all(p);
    } catch (e: any) {
      console.trace(e.toString());

      // フラグを元に戻す
      const update: Partial<TestrunReservation> =
        at === 1 ? { pre_call_sent: false } : { call_sent: false };

      await firestore
        .collection(TESTRUN_COLLECTION)
        .doc(targetId)
        .withConverter(testrunDataConverter())
        .update(update);
    }
  });

  await Promise.all(sidesPromises);
}

export async function testConcurrentCreateTestrun(
  state: ActionResult,
  formData: FormData,
) {
  const formDataArray = Array.from({ length: 4 }, () => new FormData());

  // username 01_asahikawaのuser_idを取得
  const asahikawaId = (
    await db
      .selectFrom("user")
      .where("username", "=", "01_asahikawa")
      .select("id")
      .executeTakeFirst()
  )?.id;
  // username 02_hakodateのuser_idを取得
  const hakodateId = (
    await db
      .selectFrom("user")
      .where("username", "=", "02_hakodate")
      .select("id")
      .executeTakeFirst()
  )?.id;
  // username 03_ichinosekiのuser_idを取得
  const ichinosekiId = (
    await db
      .selectFrom("user")
      .where("username", "=", "03_ichinoseki")
      .select("id")
      .executeTakeFirst()
  )?.id;
  // username 04_fukushimaのuser_idを取得
  const fukushimaId = (
    await db
      .selectFrom("user")
      .where("username", "=", "04_fukushima")
      .select("id")
      .executeTakeFirst()
  )?.id;

  if (asahikawaId) {
    formDataArray[0].set("bookerId", asahikawaId); // 旭川
  }
  if (hakodateId) {
    formDataArray[1].set("bookerId", hakodateId); // 函館
  }
  if (ichinosekiId) {
    formDataArray[2].set("bookerId", ichinosekiId); // 一関
  }
  if (fukushimaId) {
    formDataArray[3].set("bookerId", fukushimaId); // 福島
  }

  formData.forEach((value, key) => {
    formDataArray.forEach((fd) => fd.append(key, value));
  });

  const promises = formDataArray.map((fd) => createTestrun(state, fd));

  const results = await Promise.all(promises);

  // Merge results with numbering
  const errors = results
    .map((result, index) => `Error ${index + 1}: ${result.errors}`)
    .filter((error) => error !== "Error ${index + 1}: ")
    .join("\n");

  return { errors };
}
