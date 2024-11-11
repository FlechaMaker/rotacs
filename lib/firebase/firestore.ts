// https://qiita.com/FAL-coffee/items/3496036b7acbb3493bc1

import "client-only";

import {
  FirestoreDataConverter,
  WithFieldValue,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";

export interface DocumentSnapshotType extends Object {
  [key: string]: any | Timestamp | Date;
}

export const dataConverter = <
  T extends DocumentSnapshotType,
>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: WithFieldValue<T>) => {
    return { ...data };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<T>) => {
    const data = snapshot.data();

    return data;
  },
});
