"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  requestPasswordReset,
  type EmailAuthState,
} from "@/app/login/actions";
import { AuthFormField } from "@/components/auth/AuthFormField";

const initialState: EmailAuthState = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  return (
    <form action={action} className="space-y-4 text-left">
      {state.error && (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.error}
        </p>
      )}

      {state.message && (
        <p role="status" className="callout-sage px-4 py-3 text-sm text-foreground">
          {state.message}
        </p>
      )}

      <AuthFormField
        id="reset-email"
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="tu@email.com"
      />

      <button
        type="submit"
        disabled={pending}
        className="btn-terracotta inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold text-white transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-strong focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar enlace de recuperación"}
      </button>

      <p className="text-center text-sm text-muted">
        <Link
          href="/login"
          className="font-medium text-sage-strong underline-offset-2 hover:underline"
        >
          Volver a entrar
        </Link>
      </p>
    </form>
  );
}
