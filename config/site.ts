export type SiteConfig = typeof siteConfig;

type Route = Record<string, any>;

export const routes: Route = {
  label: "Home",
  href: "/",
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
    notification: {
      label: "通知",
      href: "/settings/notification",
    },
    users: {
      label: "ユーザー",
      href: "/settings/users",
    },
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
  name: "RoTACS",
  description: "Robocon Testrun And Check Scheduler",
  tabItems: [routes.home, routes.about],
  navMenuItemsSignedOut: [routes.home, routes.login],
  navMenuItemsSignedIn: [
    routes.home,
    routes.about,
    routes.settings,
    routes.logout,
  ],
  userMenuItems: [routes.settings, routes.logout],
  settingTabItems: [routes.settings.notification],
  adminSettingTabItems: [routes.settings.notification, routes.settings.users],
  links: {
    github: "https://github.com/nextui-org/nextui",
    twitter: "https://twitter.com/getnextui",
    docs: "https://nextui.org",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
