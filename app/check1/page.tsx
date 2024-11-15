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

import { getCheckSchedule, onCheckCollectionChange } from "@/lib/client/check";
import {
  pageContainer,
  pageSubtitle,
  pageTitle,
} from "@/components/primitives";
import CheckReservationCard from "@/components/check-reservation-card";
import {
  CHECK1_COLLECTION,
  CheckSchedule,
  CheckSide,
  CheckSides,
  CheckStatus,
} from "@/types/check";

export default function Check() {
  const [schedule, setSchedule] = React.useState<CheckSchedule | undefined>(
    undefined,
  );

  React.useEffect(() => {
    getCheckSchedule(CHECK1_COLLECTION).then((_newSchedule) => {
      const newSchedule = new CheckSchedule(_newSchedule);

      setSchedule(newSchedule);
    });

    return onCheckCollectionChange(CHECK1_COLLECTION, (_) => {
      getCheckSchedule(CHECK1_COLLECTION).then((_newSchedule) => {
        const newSchedule = new CheckSchedule(_newSchedule);

        setSchedule(newSchedule);
      });
    });
  }, []);

  const statusOrder: CheckStatus[] = [
    "再検査",
    "合格",
    "実施中",
    "準備中",
    "実施決定",
    "順番待ち",
    "キャンセル",
  ];

  function getBgColor(side: CheckSide, status: CheckStatus) {
    return side === "東" ? "bg-warning-50" : "bg-success-50";
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
              {CheckSides.map((side) => (
                <div
                  key={side}
                  className="grid grid-cols-1 place-content-start gap-4"
                >
                  {schedule.get(side, status).map((r) => (
                    <CheckReservationCard
                      key={r}
                      bgColor={getBgColor(side, status)}
                      collectionId={CHECK1_COLLECTION}
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
        <h1 className={pageTitle()}>計量計測1（土曜日）</h1>
        <h2 className={pageSubtitle()}>
          表示順の上から下に向かって計量計測を実施していきます．現在表示されている予約はサンプルです．予約開始時刻に削除します．
        </h2>
        <div className="my-4 flex items-stretch justify-start">
          <Link
            className={buttonStyle({
              color: "success",
            })}
            href="/check1/new"
          >
            <Icon icon="mdi:plus" />
            計量計測を予約する
          </Link>
        </div>
        <Divider />
        {scheduleView}
      </div>
    </div>
  );
}
