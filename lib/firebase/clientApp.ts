"use client";

import "client-only";

import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import { firebaseConfig } from "./clientConfig";

export const firebaseApp =
  getApps().length === 0
    ? initializeApp(firebaseConfig, "client")
    : getApps()[0];
export const firestore = getFirestore(firebaseApp);
