"use server";

import { redirect } from "next/navigation";
import { finalizeAuthenticatedSession } from "@/lib/auth-session";
import {
  buildOAuthCallbackUrl,
  getAuthSiteOrigin,
  sanitizePostAuthRedirect,
} from "@/lib/domain/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export interface EmailAuthState {
  error?: string;
  message?: string;
}

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (lower.includes("user already registered")) {
    return "Ya existe una cuenta con este correo. Prueba a entrar.";
  }
  if (lower.includes("password")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (lower.includes("email")) {
    return "Introduce un correo electrónico válido.";
  }
  return "No se pudo completar el inicio de sesión. Inténtalo de nuevo.";
}

function authOrigin(): string {
  return getAuthSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL);
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signInWithEmail(
  _prevState: EmailAuthState,
  formData: FormData,
): Promise<EmailAuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase no está configurado." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = sanitizePostAuthRedirect(
    String(formData.get("next") ?? ""),
    "/learn",
  );

  if (!email || !password) {
    return { error: "Introduce correo y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  await finalizeAuthenticatedSession(nextPath);
  return {};
}

export async function signUpWithEmail(
  _prevState: EmailAuthState,
  formData: FormData,
): Promise<EmailAuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase no está configurado." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = sanitizePostAuthRedirect(
    String(formData.get("next") ?? ""),
    "/learn",
  );

  if (!email || !password) {
    return { error: "Introduce correo y contraseña." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: buildOAuthCallbackUrl(authOrigin(), "/auth/confirmed"),
    },
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  if (data.session) {
    await finalizeAuthenticatedSession(nextPath);
    return {};
  }

  return {
    message:
      "Te hemos enviado un correo de confirmación. Revisa tu bandeja de entrada para activar la cuenta.",
  };
}

export async function requestPasswordReset(
  _prevState: EmailAuthState,
  formData: FormData,
): Promise<EmailAuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase no está configurado." };
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Introduce tu correo electrónico." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: buildOAuthCallbackUrl(authOrigin(), "/auth/reset-password"),
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  return {
    message:
      "Si existe una cuenta con ese correo, te hemos enviado un enlace para restablecer la contraseña.",
  };
}

export async function updatePassword(
  _prevState: EmailAuthState,
  formData: FormData,
): Promise<EmailAuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase no está configurado." };
  }

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!password || password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión ha caducado. Solicita un nuevo enlace." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: mapAuthError(error.message) };
  }

  await finalizeAuthenticatedSession("/learn");
  return {};
}
