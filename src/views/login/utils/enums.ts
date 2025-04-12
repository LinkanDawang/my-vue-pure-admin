import { $t } from "@/plugins/i18n";

const operates = [
  {
    title: $t("login.phoneLogin")
  },
  {
    title: $t("login.qRCodeLogin")
  },
  {
    title: $t("login.register")
  }
];

const thirdParty = [
  {
    title: $t("login.dingTalkLogin"),
    icon: "dingding"
  },
  {
    title: $t("login.githubLogin"),
    icon: "github"
  },
  {
    title: $t("login.weChatLogin"),
    icon: "wechat"
  },
  {
    title: $t("login.alipayLogin"),
    icon: "alipay"
  },
  {
    title: $t("login.qqLogin"),
    icon: "qq"
  }
];

export { operates, thirdParty };
