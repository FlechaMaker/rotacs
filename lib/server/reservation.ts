import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
  WithFieldValue,
} from "firebase-admin/firestore";

import { Reservation } from "@/types/reservation";

export function validateFormData<SideType extends string>(formData: FormData) {
  if (!formData.has("side")) {
    throw Error("エリアが指定されていません");
  }
  const sideValue = formData.get("side");

  if (!sideValue) {
    throw new Error("エリアの情報が不正です");
  }
  const side = sideValue.toString() as SideType;

  return { side };
}

export function reservationDataConverter<
  StatusType extends string,
  SideType extends string,
>(): FirestoreDataConverter<Reservation<StatusType, SideType>> {
  return {
    toFirestore: (data: WithFieldValue<Reservation<StatusType, SideType>>) => {
      return objectifyReservation(data as Reservation<StatusType, SideType>);
    },
    fromFirestore: (
      snapshot: QueryDocumentSnapshot<Reservation<StatusType, SideType>>,
    ) => {
      const data = snapshot.data() as any;

      data.reserved_at = data.reserved_at.toDate();
      data.fixed_at = data.fixed_at ? data.fixed_at.toDate() : null;
      data.finished_at = data.finished_at ? data.finished_at.toDate() : null;

      return data as Reservation<StatusType, SideType>;
    },
  };
}

export function objectifyReservation<
  StatusType extends string,
  SideType extends string,
>(reservation: Reservation<StatusType, SideType>) {
  return {
    ...reservation,
    reserved_at: Timestamp.fromDate(reservation.reserved_at),
    fixed_at: reservation.fixed_at
      ? Timestamp.fromDate(reservation.fixed_at)
      : null,
    finished_at: reservation.finished_at
      ? Timestamp.fromDate(reservation.finished_at)
      : null,
  };
}
