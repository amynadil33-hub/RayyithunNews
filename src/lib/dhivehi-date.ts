const DHIVEHI_DAYS = [
  "އާދީއްތަ",
  "ހޯމަ",
  "އަންގާރަ",
  "ބުދަ",
  "ބުރާސްފަތި",
  "ހުކުރު",
  "ހޮނިހިރު",
] as const;

const DHIVEHI_MONTHS = [
  "ޖަނަވަރީ",
  "ފެބްރުވަރީ",
  "މާރޗް",
  "އޭޕްރީލް",
  "މޭ",
  "ޖޫން",
  "ޖުލައި",
  "އޮގަސްޓް",
  "ސެޕްޓެމްބަރ",
  "އޮކްޓޯބަރ",
  "ނޮވެމްބަރ",
  "ޑިސެމްބަރ",
] as const;

function asDate(value: string | number | Date) {
  return value instanceof Date ? value : new Date(value);
}

export function formatDhivehiDate(value: string | number | Date) {
  const date = asDate(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${DHIVEHI_DAYS[date.getDay()]}، ${date.getDate()} ${DHIVEHI_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDhivehiRelativeTime(
  value: string | number | Date,
  now: string | number | Date = new Date(),
) {
  const date = asDate(value);
  const current = asDate(now);
  if (Number.isNaN(date.getTime()) || Number.isNaN(current.getTime()))
    return "";

  const elapsed = Math.max(0, current.getTime() - date.getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "މިހާރު";
  if (minutes < 60) return `${minutes} މިނިޓު ކުރިން`;

  const hours = Math.floor(elapsed / 3_600_000);
  if (hours < 24) return `${hours} ގަޑިއިރު ކުރިން`;

  const days = Math.floor(elapsed / 86_400_000);
  if (days < 7) return `${days} ދުވަސް ކުރިން`;
  return formatDhivehiDate(date);
}
