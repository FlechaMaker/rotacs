import "server-cli-only";

import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
  WithFieldValue,
} from "firebase-admin/firestore";
import { User } from "lucia";

import { Reservation } from "@/types/reservation";
import { db } from "@/lib/server/db";

export async function validateFormData<SideType extends string>(
  formData: FormData,
  currentUser: User,
): Promise<{ side: SideType; booker: User }> {
  // formDataの検証
  if (!formData.has("side")) {
    throw Error("エリアが指定されていません");
  }
  const sideValue = formData.get("side");

  if (!sideValue) {
    throw new Error("エリアの情報が不正です");
  }
  const side = sideValue.toString() as SideType;

  let bookerId: string | undefined = undefined;

  if (formData.has("bookerId")) {
    bookerId = formData.get("bookerId")?.toString();
  }

  // Adminは他のユーザの予約を作成できる
  // 指定されたユーザーの予約を作成する権限があるかを検証
  let booker: User = currentUser;

  if (currentUser.role === "admin") {
    if (bookerId) {
      const _booker = await db
        .selectFrom("user")
        .where("id", "=", bookerId)
        .selectAll()
        .executeTakeFirst();

      if (!_booker) {
        console.trace("指定されたユーザが存在しません");

        throw Error("指定されたユーザが存在しません");
      }

      booker = _booker;
    }
  } else {
    if (bookerId && bookerId !== currentUser.id) {
      console.trace("他のユーザの予約を作成することはできません");

      throw Error("他のユーザの予約を作成することはできません");
    }
  }

  return { side, booker };
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
