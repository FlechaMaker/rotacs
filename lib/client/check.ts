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

import {
  CheckReservation,
  CheckSchedule,
  CheckSide,
  CheckStatus,
} from "@/types/check";
import { firestore } from "@/lib/firebase/clientApp";
import { reservationDataConverter } from "@/lib/client/reservation";

export async function getCheckReservation(
  id: string,
  collectionId: string,
): Promise<CheckReservation | null> {
  const docRef = doc(firestore, collectionId, id).withConverter(
    checkDataConverter(),
  );
  const check = await getDoc(docRef);

  if (!check.exists()) {
    console.info(`ID: ${id} のテストラン予約は存在しません`);

    return null;
  }

  return check.data();
}

export async function getCheckSchedule(
  collectionId: string,
): Promise<CheckSchedule> {
  const q = collection(firestore, collectionId).withConverter(
    checkDataConverter(),
  );
  const snapshot = await getDocs(q);
  const reservations = snapshot.docs.map((doc) => doc.data());

  let schedule = CheckSchedule.fromUnsorted(reservations);

  return schedule;
}

export function onCheckReservationChange(
  id: string,
  collectionId: string,
  callback: (reservation: CheckReservation | null) => void,
) {
  const docRef = doc(firestore, collectionId, id).withConverter(
    checkDataConverter(),
  );

  return onSnapshot(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);

      return;
    }

    callback(snapshot.data());
  });
}

export function onCheckCollectionChange(
  collectionId: string,
  callback: (schedule: QuerySnapshot<CheckReservation, DocumentData>) => void,
) {
  const checkRef = collection(firestore, collectionId).withConverter(
    checkDataConverter(),
  );

  return onSnapshot(checkRef, (snapshot) => {
    callback(snapshot);
  });
}

function checkDataConverter(): FirestoreDataConverter<CheckReservation> {
  return reservationDataConverter<CheckStatus, CheckSide>();
}
