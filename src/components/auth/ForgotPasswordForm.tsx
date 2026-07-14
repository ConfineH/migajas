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
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.error}
        </p>
      )}

      {state.message && (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
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
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar enlace de recuperación"}
      </button>

      <p className="text-center text-sm text-gray-600">
        <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
          Volver a entrar
        </Link>
      </p>
    </form>
  );
}
