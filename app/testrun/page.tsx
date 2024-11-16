"use client";

import "client-only";

import React from "react";
import {
  Accordion,
  AccordionItem,
  button as buttonStyle,
  Divider,
  Link,
  Spinner,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";

import {
  getTestrunSchedule,
  onTestrunCollectionChange,
} from "@/lib/client/testrun";
import {
  pageContainer,
  pageSubtitle,
  pageTitle,
} from "@/components/primitives";
import TestrunReservationCard from "@/components/testrun-reservation-card";
import {
  TestrunSchedule,
  TestrunSide,
  TestrunSides,
  TestrunStatus,
} from "@/types/testrun";

export default function Testrun() {
  const [schedule, setSchedule] = React.useState<TestrunSchedule | undefined>(
    undefined,
  );

  React.useEffect(() => {
    getTestrunSchedule().then((_newSchedule) => {
      const newSchedule = new TestrunSchedule(_newSchedule);

      setSchedule(newSchedule);
    });

    return onTestrunCollectionChange((_) => {
      getTestrunSchedule().then((_newSchedule) => {
        const newSchedule = new TestrunSchedule(_newSchedule);

        setSchedule(newSchedule);
      });
    });
  }, []);

  const statusOrder: TestrunStatus[] = [
    "終了",
    "実施中",
    "準備中",
    "実施決定",
    "順番待ち",
    "キャンセル",
  ];

  function getBgColor(side: TestrunSide, status: TestrunStatus) {
    return side === "赤" ? "bg-danger-50" : "bg-primary-50";
  }

  const scheduleView =
    schedule === undefined ? (
      <Spinner className="flex py-4" label="読み込み中..." />
    ) : (
      <Accordion
        defaultExpandedKeys={["実施中", "準備中", "実施決定", "順番待ち"]}
        selectionMode="multiple"
      >
        {statusOrder.map((status) => (
          <AccordionItem
            key={status}
            aria-label={status}
            title={
              <span className="block w-full text-center text-xl font-bold text-default-700">
                {status}
              </span>
            }
          >
            <div
              key={`${status}-items`}
              className="my-4 grid grid-cols-2 gap-4 md:gap-8"
            >
              {TestrunSides.map((side) => (
                <div
                  key={side}
                  className="grid grid-cols-1 place-content-start gap-4"
                >
                  {schedule.get(side, status).map((r) => (
                    <TestrunReservationCard
                      key={r}
                      bgColor={getBgColor(side, status)}
                      reservationId={r}
                    />
                  ))}
                </div>
              ))}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    );

  return (
    <div className={pageContainer()}>
      {/* Title */}
      <div className="flex-col items-stretch">
        <h1 className={pageTitle()}>テストラン</h1>
        <h2 className={pageSubtitle()}>
          表示順の上から下に向かってテストランを実施していきます．テストランは13:30からです．（システム上先頭の方に呼び出し予告通知は送信されますが．13:30までは開始しません）
        </h2>
        <div className="my-4 flex items-stretch justify-start">
          <Link
            className={buttonStyle({
              color: "success",
            })}
            href="/testrun/new"
          >
            <Icon icon="mdi:plus" />
            テストランを予約する
          </Link>
        </div>
        <Divider />
        {scheduleView}
      </div>
    </div>
  );
}
