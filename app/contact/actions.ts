"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitContactMessage(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const inquiryType = String(formData.get("inquiry_type") ?? "other").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    redirect("/contact?error=Please+fill+in+your+name%2C+email+and+message.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    inquiry_type: inquiryType,
    message,
  });

  if (error) {
    redirect(`/contact?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/contact?sent=1");
}
