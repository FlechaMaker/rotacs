"use client";

import { DropdownItem, DropdownMenu, Link } from "@nextui-org/react";
import { User } from "lucia";

import { siteConfig } from "@/config/site";

export default function UserMenuDropdownMenu(props: { userJson: string }) {
  const user = JSON.parse(props.userJson) as User;

  const items = [
    <DropdownItem key="profile" className="h-14 gap-2">
      <p className="font-semibold">{user.username}</p>
    </DropdownItem>,
  ];

  siteConfig.userMenuItems.forEach((item) => {
    items.push(
      <DropdownItem key={item.href}>
        <Link className="text-inherit" href={item.href}>
          {item.label}
        </Link>
      </DropdownItem>,
    );
  });

  return (
    <DropdownMenu aria-label="Profile Actions" variant="flat">
      {items}
    </DropdownMenu>
  );
}
