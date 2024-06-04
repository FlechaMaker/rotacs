"use server";

import {
  Navbar as NextUiNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  Link,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  AvatarGroup,
  Avatar,
  Tooltip,
  ScrollShadow,
  Divider,
  Badge,
  Spacer,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";

import NavigationTabs from "@/components/navigation-tabs";
import NavbarMenu from "@/components/navbar-menu";
import UserMenu from "@/components/usermenu";
import Breadcrumbs from "@/components/breadcrumb";
import NotificationsCard from "@/components/notifications-card";
import { ThemeSwitch } from "@/components/theme-switch";
import { validateRequest } from "@/lib/auth";

export async function Navbar() {
  const user = await validateRequest();

  return (
    <div className="w-full">
      <NextUiNavbar
        classNames={{
          base: "pt-2 lg:pt-4 lg:bg-transparent lg:backdrop-filter-none",
          wrapper: "px-4 sm:px-6",
          item: "data-[active=true]:text-primary",
        }}
        height="60px"
        maxWidth="full"
      >
        <NavbarBrand>
          <NavbarMenuToggle className="mr-6 h-6" />
          <Link className="text-inherit" href="/">
            <p className="font-bold text-inherit">ROTACS</p>
          </Link>
        </NavbarBrand>

        {/* Right Menu */}
        <NavbarContent
          className="ml-auto h-12 max-w-fit items-center gap-0"
          justify="end"
        >
          <NavbarItem className="hidden sm:flex">
            <Breadcrumbs />
          </NavbarItem>
          <Spacer x={6} />
          {/* Search */}
          {/* <NavbarItem className="mr-2 hidden sm:flex">
            <Input
              aria-label="Search"
              classNames={{
                inputWrapper: "bg-content2 dark:bg-content1",
              }}
              labelPlacement="outside"
              placeholder="Search..."
              radius="full"
              startContent={
                <Icon
                  className="text-default-500"
                  icon="solar:magnifer-linear"
                  width={20}
                />
              }
            />
          </NavbarItem> */}
          <NavbarItem className="hidden sm:flex">
            <ThemeSwitch className="text-default-500" size={24} />
          </NavbarItem>
          {/* Settings */}
          <NavbarItem className="hidden sm:flex">
            <Button isIconOnly radius="full" variant="light">
              <Icon
                className="text-default-500"
                icon="solar:settings-linear"
                width={24}
              />
            </Button>
          </NavbarItem>
          {/* Notifications */}
          <NavbarItem className="flex">
            <Popover offset={12} placement="bottom-end">
              <PopoverTrigger>
                <Button
                  disableRipple
                  isIconOnly
                  className="overflow-visible"
                  radius="full"
                  variant="light"
                >
                  <Badge
                    color="danger"
                    content="5"
                    showOutline={false}
                    size="md"
                  >
                    <Icon
                      className="text-default-500"
                      icon="solar:bell-linear"
                      width={22}
                    />
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="max-w-[90vw] p-0 sm:max-w-[380px]">
                <NotificationsCard className="w-full shadow-none" />
              </PopoverContent>
            </Popover>
          </NavbarItem>
          {/* User Menu */}
          <NavbarItem className="px-2">
            <UserMenu />
          </NavbarItem>
        </NavbarContent>

        {/* Menu */}
        <NavbarMenu userJson={JSON.stringify(user)} />
      </NextUiNavbar>
      <main className="flex w-full justify-center lg:mt-6">
        <ScrollShadow
          hideScrollBar
          className="flex w-full justify-between gap-8 border-b border-divider px-4 sm:px-8"
          orientation="horizontal"
        >
          <NavigationTabs />
          <div className="flex items-center gap-4">
            <AvatarGroup max={3} size="sm" total={10}>
              <Tooltip content="John" placement="bottom">
                <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
              </Tooltip>
              <Tooltip content="Mark" placement="bottom">
                <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
              </Tooltip>
              <Tooltip content="Jane" placement="bottom">
                <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
              </Tooltip>
            </AvatarGroup>
            <Divider className="h-6" orientation="vertical" />
            <Tooltip content="New deployment" placement="bottom">
              <Button isIconOnly radius="full" size="sm" variant="faded">
                <Icon
                  className="text-default-500"
                  icon="lucide:plus"
                  width={16}
                />
              </Button>
            </Tooltip>
          </div>
        </ScrollShadow>
      </main>
    </div>
  );
}
