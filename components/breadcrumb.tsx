"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumbs as NextUiBreadcrumbs,
  BreadcrumbItem,
  Link,
} from "@nextui-org/react";

import { capitalize } from "@/lib/utils";

export default function Breadcrumbs() {
  const pathname = usePathname();

  return (
    <NextUiBreadcrumbs className="hidden lg:flex" radius="full">
      {pathname === "/" ? (
        <> </>
      ) : (
        pathname.split("/").map((currentDir, index) => {
          let pathUrl = pathname
            .split("/")
            .slice(0, index + 1)
            .join("/");

          if (pathUrl === pathname) {
            pathUrl = "#";
          }

          return (
            <BreadcrumbItem key={index}>
              <Link
                className="text-inherit"
                href={pathUrl === "#" ? "#" : `/${pathUrl}`}
              >
                {currentDir === "" ? "Home" : capitalize(currentDir)}
              </Link>
            </BreadcrumbItem>
          );
        })
      )}
    </NextUiBreadcrumbs>
  );
}
