import { Reservation, Schedule } from "@/types/reservation";

export const TESTRUN_COLLECTION =
  process.env.NEXT_PUBLIC_TESTRUN_RESERVATION_COLLECTION ||
  "testrun_reservations";

export const TestrunStatuses = [
  "順番待ち",
  "実施決定",
  "準備中",
  "実施中",
  "終了",
  "キャンセル",
] as const;
export type TestrunStatus = (typeof TestrunStatuses)[number];

export const TestrunSides = ["赤", "青"] as const;
export type TestrunSide = (typeof TestrunSides)[number];

export class TestrunReservation extends Reservation<
  TestrunStatus,
  TestrunSide
> {
  constructor(
    options: Partial<TestrunReservation> & {
      user_id: string;
      user_display_name: string;
      reservation_count: number;
      status: TestrunStatus;
      side: TestrunSide;
    },
  ) {
    super(options);
  }
}

export class TestrunSchedule extends Schedule<TestrunStatus, TestrunSide> {
  constructor(initial?: TestrunSchedule) {
    super(initial);
  }
}
