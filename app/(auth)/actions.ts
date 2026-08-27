"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { siteOrigin } from "@/lib/site-origin";

// Sign-in accepts a username as well as an email — usernames aren't stored
// with an email address (that lives in auth.users, not public.profiles), so
// this resolves one to the other via the service-role client, since an
// anonymous sign-in attempt has no session for RLS to allow the lookup
// under. Returns null (rather than throwing) on any miss, so the caller
// falls through to Supabase's own generic "Invalid login credentials" error
// instead of leaking whether a username exists.
async function emailForUsername(username: string): Promise<string | null> {
  if (!username) return null;
  const service = createServiceClient();

  const { data: profile } = await service
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return null;

  const { data } = await service.auth.admin.getUserById(profile.id);
  return data.user?.email ?? null;
}

export async function signUp(formData: FormData) {
  const role = formData.get("role") === "creative" ? "creative" : "brand";
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const companyName = String(formData.get("company_name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!firstName || !lastName || !username || !email || !password) {
    redirect(`/sign-up?error=${encodeURIComponent("Please fill in all required fields.")}&role=${role}`);
  }
  if (role === "brand" && !companyName) {
    redirect(`/sign-up?error=${encodeURIComponent("Please enter your company name.")}&role=${role}`);
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
        company_name: role === "brand" ? companyName : null,
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
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const email = identifier.includes("@") ? identifier : await emailForUsername(identifier);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: email ?? identifier, password });

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

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    redirect(`/forgot-password?error=${encodeURIComponent("Enter your email address.")}`);
  }

  const supabase = await createClient();
  const origin = await siteOrigin();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  // Always redirect to the same confirmation screen, whether or not the
  // email exists — avoids leaking which addresses have accounts.
  redirect("/forgot-password/check-email");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password !== confirmPassword) {
    redirect(`/reset-password?error=${encodeURIComponent("Passwords do not match.")}`);
  }
  if (password.length < 8) {
    redirect(`/reset-password?error=${encodeURIComponent("Password must be at least 8 characters.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/sign-in?reset=1");
}
