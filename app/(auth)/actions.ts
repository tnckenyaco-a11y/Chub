"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const role = formData.get("role") === "creative" ? "creative" : "brand";
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!firstName || !lastName || !username || !email || !password) {
    redirect(`/sign-up?error=${encodeURIComponent("Please fill in all required fields.")}&role=${role}`);
  }
  if (password !== confirmPassword) {
    redirect(`/sign-up?error=${encodeURIComponent("Passwords do not match.")}&role=${role}`);
  }
  if (password.length < 8) {
    redirect(`/sign-up?error=${encodeURIComponent("Password must be at least 8 characters.")}&role=${role}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        first_name: firstName,
        last_name: lastName,
        username,
        phone: phone || null,
        country: country || null,
        city: city || null,
      },
    },
  });

  if (error) {
    redirect(`/sign-up?error=${encodeURIComponent(error.message)}&role=${role}`);
  }

  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/sign-up/check-email");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
