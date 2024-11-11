"use server";

import "server-cli-only";

import { FirestoreDataConverter } from "firebase-admin/firestore";

import {
  TestrunReservation,
  TestrunSide,
  TestrunStatus,
  TESTRUN_COLLECTION,
} from "@/types/testrun";
import { getFirestore } from "@/lib/firebase/serverApp";
import { validateRequest } from "@/lib/server/auth";
import {
  reservationDataConverter,
  validateFormData,
} from "@/lib/server/reservation";
import { ActionResult } from "@/types/actions";

export async function createTestrun(
  state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await validateRequest();

  if (!user) {
    return { errors: "認証情報が不正です．ログインしなおしてください" };
  }

  let side: TestrunSide;

  try {
    const ret = validateFormData<TestrunSide>(formData);

    side = ret.side;
  } catch (e: any) {
    return { errors: e.toString() };
  }

  try {
    const firestore = await getFirestore();

    const result = await firestore.runTransaction(async (transaction) => {
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
        .where("user_id", "==", user.id)
        .where("status", "in", existsStatus);
      const incompleteSnapshot = await transaction.get(incompleteRef);

      if (!incompleteSnapshot.empty) {
        return { errors: "既に予約が存在します" };
      }

      const finishedRef = collection
        .where("user_id", "==", user.id)
        .where("status", "==", "終了");
      const finishedSnapshot = await transaction.get(finishedRef);
      const reservationCount = finishedSnapshot.size + 1;

      const testrun = new TestrunReservation({
        user_id: user.id,
        user_display_name: user.display_name,
        reservation_count: reservationCount,
        status: "順番待ち",
        side,
      });

      const reservationRef = collection.doc();

      transaction.set(reservationRef, testrun);
    });

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
