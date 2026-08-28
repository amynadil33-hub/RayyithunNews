import { supabase } from "../lib/supabaseClient.ts";
import type {
  ContactMessage,
  AdvertiserInquiry,
  NewsletterSubscriber,
} from "../lib/database.types.ts";

type NotificationType =
  | "contact"
  | "advertising"
  | "reader_article"
  | "newsletter"
  | "comment";

export async function sendFormNotification(
  type: NotificationType,
  fields: Record<string, unknown>,
) {
  const response = await fetch("/api/form-notification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, fields }),
  });

  if (!response.ok) {
    throw new Error(
      "The form was saved, but its email notification could not be delivered.",
    );
  }
}

async function persistContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const { error } = await supabase.from("contact_messages").insert({
    ...data,
    status: "unread",
  } as never);
  if (error) throw error;
}

// Contact Messages
export async function submitContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  await persistContactMessage(data);
  await sendFormNotification("contact", data);
}

export async function getContactMessages() {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContactMessage[];
}

export async function updateMessageStatus(
  id: string,
  status: ContactMessage["status"],
) {
  const { error } = await supabase
    .from("contact_messages")
    .update({ status } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function submitReaderArticle(data: {
  name: string;
  address: string;
  email: string;
  phone: string;
  content: string;
  photo?: File | null;
}) {
  let photoUrl = "";

  if (data.photo) {
    const safeName = data.photo.name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-");
    const filePath = `reader-submissions/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("article-images")
      .upload(filePath, data.photo, { cacheControl: "3600", upsert: false });
    if (uploadError) throw uploadError;
    photoUrl = supabase.storage.from("article-images").getPublicUrl(filePath)
      .data.publicUrl;
  }

  const message = [
    "ކިޔުންތެރިއަކު ހުށަހެޅި އާރޓިކަލް",
    `އެޑްރެސް: ${data.address}`,
    `ފޮޓޯ: ${photoUrl || "ނެތް"}`,
    "",
    data.content,
  ].join("\n");

  await persistContactMessage({
    name: data.name,
    email: data.email,
    phone: data.phone,
    message,
  });
  await sendFormNotification("reader_article", {
    name: data.name,
    address: data.address,
    email: data.email,
    phone: data.phone,
    content: data.content,
    photo_url: photoUrl,
  });
}

// Advertiser Inquiries
export async function submitAdvertiserInquiry(data: {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  message?: string;
  preferred_placement?: string;
}) {
  const { error } = await supabase.from("advertiser_inquiries").insert({
    ...data,
    status: "new",
  } as never);
  if (error) throw error;
  await sendFormNotification("advertising", data);
}

export async function getAdvertiserInquiries() {
  const { data, error } = await supabase
    .from("advertiser_inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdvertiserInquiry[];
}

export async function updateInquiryStatus(
  id: string,
  status: AdvertiserInquiry["status"],
) {
  const { error } = await supabase
    .from("advertiser_inquiries")
    .update({ status } as never)
    .eq("id", id);
  if (error) throw error;
}

// Newsletter
export async function subscribeToNewsletter(email: string, portalId?: string) {
  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email, portal_id: portalId ?? null, is_active: true } as never, {
      onConflict: "email",
    });
  if (error) throw error;
  await sendFormNotification("newsletter", {
    email,
    portal_id: portalId ?? "",
  });
}

export async function getNewsletterSubscribers() {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*, portal:portals(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as NewsletterSubscriber[];
}
