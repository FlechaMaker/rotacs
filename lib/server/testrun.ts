"use server";

import "server-cli-only";

import { FirestoreDataConverter } from "firebase-admin/firestore";
import { User } from "lucia";

import {
  TestrunReservation,
  TestrunSide,
  TestrunStatus,
  TESTRUN_COLLECTION,
} from "@/types/testrun";
import { ActionResult } from "@/types/actions";
import { getFirestore } from "@/lib/firebase/serverApp";
import { validateRequest } from "@/lib/server/auth";
import {
  reservationDataConverter,
  validateFormData,
} from "@/lib/server/reservation";
import { db } from "@/lib/server/db";

export async function testConcurrentCreateTestrun(
  state: ActionResult,
  formData: FormData,
) {
  const formDataArray = Array.from({ length: 10 }, () => new FormData());

  formDataArray[0].set("bookerId", "r5dwiqin65fqevpq"); // 旭川
  formDataArray[1].set("bookerId", "afyka24kl4kqyrq6"); // 函館
  formDataArray[2].set("bookerId", "efpv6gripyd6h5us"); // 一関
  formDataArray[3].set("bookerId", "r5dwiqin65fqevpq"); // 旭川
  formDataArray[4].set("bookerId", "afyka24kl4kqyrq6"); // 函館
  formDataArray[5].set("bookerId", "efpv6gripyd6h5us"); // 一関
  formDataArray[6].set("bookerId", "qgt2wxnvvvjdrdnl"); // 福島
  formDataArray[7].set("bookerId", "zvmsvdybu7ty7ssn"); // 鶴岡
  formDataArray[8].set("bookerId", "dsfdjf7t5wrvryob"); // 小山
  formDataArray[9].set("bookerId", "hrwxvtti4iepaxli"); // 木更津

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

export async function createTestrun(
  state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { user: currentUser } = await validateRequest();

  if (!currentUser) {
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
        return { errors: "指定されたユーザが存在しません" };
      }

      booker = _booker;
    } else {
      booker = currentUser;
    }
  } else {
    if (bookerId && bookerId !== currentUser.id) {
      return { errors: "他のユーザの予約を作成することはできません" };
    }

    booker = currentUser;
  }

  try {
    const firestore = await getFirestore();

    console.log(`[${booker.display_name}] トランザクション開始前`);
    const result = await firestore.runTransaction(async (transaction) => {
      console.log(`[${booker.display_name}] トランザクション開始`);

      const collection = firestore
        .collection(TESTRUN_COLLECTION)
        .withConverter(testrunDataConverter());
      const existsStatus: TestrunStatus[] = [
        "順番待ち",
        "実施決定",
        "準備中",
        "実施中",
      ];

      const incompleteRef = collection
        .where("user_id", "==", booker.id)
        .where("status", "in", existsStatus);
      const incompleteSnapshot = await transaction.get(incompleteRef);

      console.log(
        `[${booker.display_name}] incompleteSnapshot.size: ${incompleteSnapshot.size}`,
      );

      if (!incompleteSnapshot.empty) {
        return { errors: "既に予約が存在します" };
      }

      const finishedRef = collection
        .where("user_id", "==", booker.id)
        .where("status", "==", "終了");
      const finishedSnapshot = await transaction.get(finishedRef);
      const reservationCount = finishedSnapshot.size + 1;

      console.log(
        `[${booker.display_name}] reservationCount: ${reservationCount}`,
      );

      const testrun = new TestrunReservation({
        user_id: booker.id,
        user_display_name: booker.display_name,
        reservation_count: reservationCount,
        status: "順番待ち",
        side,
      });

      console.log(
        `[${booker.display_name}] testrun: ${JSON.stringify(testrun)}`,
      );

      const reservationRef = collection.doc(testrun.id);

      transaction.set(reservationRef, testrun);
    });

    console.log(`[${booker.display_name}] トランザクション終了`);

    if (result?.errors) {
      return result;
    }
  } catch (e: any) {
    return { errors: e.toString() };
  }

  return {};
}

export async function updateTestrunStatus(
  id: string,
  newState: TestrunStatus,
): Promise<ActionResult> {
  const { user } = await validateRequest();

  if (!user) {
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

      if (prevState === "順番待ち" && newState === "実施決定") {
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

  return {};
}

function testrunDataConverter(): FirestoreDataConverter<TestrunReservation> {
  return reservationDataConverter<TestrunStatus, TestrunSide>();
}
