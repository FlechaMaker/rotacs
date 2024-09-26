"use server";

import {
  Dropdown,
  DropdownTrigger,
  Avatar,
  Badge,
  button,
  Link,
} from "@nextui-org/react";
import { button as buttonStyle } from "@nextui-org/theme";

import UserMenuDropdownMenu from "./usermenu-dropdownmenu";

import { validateRequest } from "@/lib/auth";

export default async function UserMenu() {
  const { user } = await validateRequest();

  if (!user) {
    return (
      <Link
        className={buttonStyle({
          color: "primary",
          radius: "full",
        })}
        href="/login"
      >
        Log In
      </Link>
    );
  } else {
    return (
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <button className="mt-1 h-8 w-8 outline-none transition-transform">
            <Avatar
              isBordered
              color="default"
              name={user.username.slice(0, 2).toUpperCase()}
              size="sm"
            />
          </button>
        </DropdownTrigger>
        <UserMenuDropdownMenu userJson={JSON.stringify(user)} />
      </Dropdown>
    );
  }
}
