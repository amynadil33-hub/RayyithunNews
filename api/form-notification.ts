import nodemailer from "nodemailer";

interface ApiRequest {
  method?: string;
  body?: unknown;
}

interface ApiResponse {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
}

type FormType =
  | "contact"
  | "advertising"
  | "reader_article"
  | "newsletter"
  | "comment";

interface NotificationRequest {
  type: FormType;
  fields: Record<string, unknown>;
}

const formLabels: Record<FormType, string> = {
  contact: "Contact message",
  advertising: "Advertising inquiry",
  reader_article: "Reader article submission",
  newsletter: "Newsletter subscription",
  comment: "Reader comment",
};

const fieldLabels: Record<string, string> = {
  name: "Name",
  company: "Company",
  email: "Email",
  phone: "Phone",
  address: "Address",
  preferred_placement: "Preferred placement",
  message: "Message",
  content: "Article",
  photo_url: "Photo",
  portal_id: "Portal ID",
  article_id: "Article ID",
  comment: "Comment",
};

function isNotificationRequest(value: unknown): value is NotificationRequest {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<NotificationRequest>;
  return (
    typeof candidate.type === "string" &&
    candidate.type in formLabels &&
    Boolean(candidate.fields) &&
    typeof candidate.fields === "object" &&
    !Array.isArray(candidate.fields)
  );
}

function cleanHeader(value: unknown) {
  return typeof value === "string" ? value.replace(/[\r\n]+/g, " ").trim() : "";
}

function fieldValue(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return "";
}

function renderMessage(data: NotificationRequest) {
  const lines = Object.entries(data.fields)
    .map(([key, value]) => {
      const rendered = fieldValue(value);
      return rendered ? `${fieldLabels[key] ?? key}:\n${rendered}` : "";
    })
    .filter(Boolean);

  return [
    `New ${formLabels[data.type]} received from the RAYYITHUN website.`,
    "",
    ...lines,
  ].join("\n\n");
}

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isNotificationRequest(request.body)) {
    response.status(400).json({ error: "Invalid form submission" });
    return;
  }

  const serialized = JSON.stringify(request.body);
  if (serialized.length > 100_000) {
    response.status(413).json({ error: "Form submission is too large" });
    return;
  }

  const host = process.env.SMTP_HOST?.trim() || "mail.privateemail.com";
  const port = Number(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const recipient = process.env.FORM_RECIPIENT?.trim() || user;

  if (!user || !password || !recipient || !Number.isInteger(port)) {
    response.status(500).json({ error: "Email delivery is not configured" });
    return;
  }

  const senderName = cleanHeader(request.body.fields.name);
  const replyTo = cleanHeader(request.body.fields.email);
  const subjectSuffix = senderName || replyTo;
  const subject = `[RAYYITHUN] ${formLabels[request.body.type]}${subjectSuffix ? ` — ${subjectSuffix}` : ""}`;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user, pass: password },
    });

    await transporter.sendMail({
      from: `"RAYYITHUN Website" <${user}>`,
      to: recipient,
      replyTo: replyTo || undefined,
      subject,
      text: renderMessage(request.body),
    });

    response.status(200).json({ ok: true });
  } catch (error) {
    console.error("Form notification email failed", error);
    response.status(502).json({ error: "Email delivery failed" });
  }
}
