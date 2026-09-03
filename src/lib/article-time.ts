export function formatRelativeAge(
  value: string | number | Date,
  isDhivehi = false,
  now: string | number | Date = new Date(),
) {
  const published = value instanceof Date ? value : new Date(value);
  const current = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(published.getTime()) || Number.isNaN(current.getTime()))
    return "";

  const hours = Math.max(
    1,
    Math.floor((current.getTime() - published.getTime()) / 3_600_000),
  );

  if (hours < 24) {
    if (isDhivehi) return `${hours} ގަޑިއިރު ކުރިން`;
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  const days = Math.floor(hours / 24);
  if (isDhivehi) return `${days} ދުވަސް ކުރިން`;
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}
