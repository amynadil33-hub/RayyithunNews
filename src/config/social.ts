import type { SocialIconName } from "../components/shared/SocialIcon.tsx";

export type SocialLink = {
  label: SocialIconName;
  href: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/rayyithunn?stkn=MXF2OGMxdXZpd2hxag==",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/19Y8h9T3x8/",
  },
  {
    label: "Viber",
    href: "https://invite.viber.com/?g2=AQBJV5yBLU%2FVAFc80%2F75IcFSlg347N%2Fsoxsn5tF5MuGWL7bK7UJ5OCUeFzTHYP8w",
  },
  { label: "Telegram", href: "https://t.me/rayyithun" },
];
