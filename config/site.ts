export type SiteConfig = typeof siteConfig;

export const pages = {
  home: {
    label: "Home",
    href: "/",
  },
  about: {
    label: "About",
    href: "/about",
  },
  settings: {
    label: "設定",
    href: "/settings",
  },
  login: {
    label: "ログイン",
    href: "/login",
  },
  logout: {
    label: "ログアウト",
    href: "/logout",
  },
};

export const siteConfig = {
  name: "Next.js + NextUI",
  description: "Make beautiful websites regardless of your design experience.",
  tabItems: [pages.home, pages.about],
  navMenuItemsSignedOut: [pages.home, pages.login],
  navMenuItemsSignedIn: [pages.home, pages.about, pages.logout],
  userMenuItems: [pages.settings, pages.logout],
  links: {
    github: "https://github.com/nextui-org/nextui",
    twitter: "https://twitter.com/getnextui",
    docs: "https://nextui.org",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
