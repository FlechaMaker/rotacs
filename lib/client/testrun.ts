import {
  collection,
  doc,
  DocumentData,
  FirestoreDataConverter,
  getDoc,
  getDocs,
  onSnapshot,
  QuerySnapshot,
} from "firebase/firestore";

import { reservationDataConverter } from "@/lib/client/reservation";
import { firestore } from "@/lib/firebase/clientApp";
import {
  TESTRUN_COLLECTION,
  TestrunReservation,
  TestrunSchedule,
  TestrunSide,
  TestrunSides,
  TestrunStatus,
  TestrunStatuses,
} from "@/types/testrun";

export async function getTestrunReservation(
  id: string,
): Promise<TestrunReservation | null> {
  const docRef = doc(firestore, TESTRUN_COLLECTION, id).withConverter(
    testrunDataConverter(),
  );
  const testrun = await getDoc(docRef);

  if (!testrun.exists()) {
    console.info(`ID: ${id} のテストラン予約は存在しません`);

    return null;
  }

  return testrun.data();
}

export async function getTestrunSchedule(): Promise<TestrunSchedule> {
  const q = collection(firestore, TESTRUN_COLLECTION).withConverter(
    testrunDataConverter(),
  );
  const snapshot = await getDocs(q);
  const reservations = snapshot.docs.map((doc) => doc.data());

  let schedule = TestrunSchedule.fromUnsorted(reservations);

  return schedule;
}

export function onTestrunReservationChange(
  id: string,
  callback: (reservation: TestrunReservation | null) => void,
) {
  const docRef = doc(firestore, TESTRUN_COLLECTION, id).withConverter(
    testrunDataConverter(),
  );

  return onSnapshot(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);

      return;
    }

    callback(snapshot.data());
  });
}

export function onTestrunCollectionChange(
  callback: (schedule: QuerySnapshot<TestrunReservation, DocumentData>) => void,
) {
  const testrunRef = collection(firestore, TESTRUN_COLLECTION).withConverter(
    testrunDataConverter(),
  );

  return onSnapshot(testrunRef, (snapshot) => {
    callback(snapshot);
  });
}

function testrunDataConverter(): FirestoreDataConverter<TestrunReservation> {
  return reservationDataConverter<TestrunStatus, TestrunSide>();
}
