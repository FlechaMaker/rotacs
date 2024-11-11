"use client";

import React from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spacer,
} from "@nextui-org/react";
import { tv } from "tailwind-variants";
import { Icon } from "@iconify/react";

import { cn } from "@/lib/cn";
import { TestrunReservation, TestrunStatus } from "@/types/testrun";
import {
  getTestrunReservation,
  onTestrunReservationChange,
} from "@/lib/client/testrun";
import { updateTestrunStatus } from "@/lib/server/testrun";

interface TestrunReservationCardProps {
  className?: string;
  bgColor: string;
  reservationId: string;
}

const infoText = tv({
  base: "text-xs block font-semibold text-default-500",
});

export default function TestrunReservationCard(
  props: TestrunReservationCardProps,
) {
  const [reservation, setReservation] =
    React.useState<TestrunReservation | null>(null);

  React.useEffect(() => {
    getTestrunReservation(props.reservationId).then((reservation) => {
      setReservation(reservation);
    });

    return onTestrunReservationChange(props.reservationId, (newReservation) => {
      setReservation(newReservation);
    });
  }, [props.reservationId]);

  async function handleStatusUpdate(status: TestrunStatus) {
    const result = await updateTestrunStatus(props.reservationId, status);

    if (result.errors) {
      console.error(result.errors);

      return;
    }
  }

  let updateTime = "";
  let card = null;

  if (reservation) {
    if (
      ["実施決定", "準備中", "実施中"].includes(reservation.status) &&
      reservation.fixed_at
    ) {
      updateTime =
        "実施決定: " +
        reservation.fixed_at.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
    } else if (reservation.status === "終了" && reservation.finished_at) {
      updateTime =
        "終了時刻: " +
        reservation.finished_at.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
    } else if (reservation.status === "順番待ち") {
      updateTime = "呼出予想: 未定";
    }

    card = (
      <Card className={cn("mt-2 w-full flex-col items-stretch", props.bgColor)}>
        <CardHeader className="grid w-full max-w-full grid-cols-3 justify-center gap-4 px-6 pb-0 pt-6">
          <div className="flex-col items-start justify-start">
            <p className={infoText()}>
              {`受信時刻: ${reservation.reserved_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
            </p>
            <p className={infoText()}>{updateTime}</p>
          </div>
          <div className="flex-col items-center justify-center">
            <h4
              className={cn(
                "text-center text-lg font-bold text-default-foreground",
              )}
            >
              {reservation.user_display_name}
            </h4>
            <p className={cn(infoText(), "text-center")}>
              {`${reservation.reservation_count}回目`}
            </p>
          </div>
          <div className="h-full w-full items-start justify-end">
            <div className="flex items-center justify-end">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly radius="full" size="sm" variant="flat">
                    <Icon
                      className="flex text-end text-2xl"
                      icon="solar:menu-dots-bold"
                    />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key="cancel"
                    color="danger"
                    onPress={() => handleStatusUpdate("キャンセル")}
                  >
                    キャンセル
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </CardHeader>
        <Spacer y={2} />
        <Divider />
        <CardBody className="flex-row items-stretch justify-start gap-2">
          <Button
            className="flex"
            color="primary"
            size="sm"
            onPress={() => handleStatusUpdate("実施決定")}
          >
            実施決定
          </Button>
          <Button
            className="flex"
            color="warning"
            size="sm"
            onPress={() => handleStatusUpdate("準備中")}
          >
            準備開始
          </Button>
          <Button
            className="flex"
            color="success"
            size="sm"
            onPress={() => handleStatusUpdate("実施中")}
          >
            開始
          </Button>
          <Button
            className="flex"
            color="default"
            size="sm"
            onPress={() => handleStatusUpdate("終了")}
          >
            終了
          </Button>
        </CardBody>
      </Card>
    );
  }

  return card;
}
