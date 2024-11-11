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

  let schedule = new TestrunSchedule();

  if (snapshot.size === 0) {
    console.info("まだテストラン予約がありません");

    return schedule;
  }

  TestrunSides.forEach((side) => {
    TestrunStatuses.forEach((status) => {
      const filtered = snapshot.docs.filter((doc) => {
        const data = doc.data();

        return data.side === side && data.status === status;
      });
      let sorted, ids;

      switch (status) {
        case "終了":
        case "キャンセル":
          sorted = filtered.sort((a, b) => {
            const aData = a.data();
            const bData = b.data();

            const aFinishedAt = aData.finished_at;
            const bFinishedAt = bData.finished_at;

            if (aFinishedAt === null || bFinishedAt === null) {
              return 0;
            }

            return aFinishedAt > bFinishedAt ? 1 : -1;
          });
          ids = sorted.map((doc) => doc.id);
          schedule.set(side, status, ids);
          break;
        case "実施決定":
        case "準備中":
        case "実施中":
          sorted = filtered.sort((a, b) => {
            const aData = a.data();
            const bData = b.data();

            const aFixedAt = aData.fixed_at;
            const bFixedAt = bData.fixed_at;

            if (aFixedAt === null || bFixedAt === null) {
              return 0;
            }

            return aFixedAt > bFixedAt ? 1 : -1;
          });
          ids = sorted.map((doc) => doc.id);
          schedule.set(side, status, ids);
          break;
        default:
          sorted = filtered.sort((a, b) => {
            const aData = a.data();
            const bData = b.data();

            const aReservationCount = aData.reservation_count;
            const bReservationCount = bData.reservation_count;

            if (aReservationCount === bReservationCount) {
              const aReservedAt = aData.reserved_at;
              const bReservedAt = bData.reserved_at;

              return aReservedAt > bReservedAt ? 1 : -1;
            }

            return aReservationCount > bReservationCount ? 1 : -1;
          });
          ids = sorted.map((doc) => doc.id);
          schedule.set(side, status, ids);
          break;
      }
    });
  });

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
