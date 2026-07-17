"use client";

import { useActionState } from "react";
import {
  updatePassword,
  type EmailAuthState,
} from "@/app/login/actions";
import { AuthFormField } from "@/components/auth/AuthFormField";

const initialState: EmailAuthState = {};

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initialState);

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

      <AuthFormField
        id="new-password"
        label="Nueva contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={6}
        placeholder="Mínimo 6 caracteres"
      />
      <AuthFormField
        id="confirm-password"
        label="Repetir contraseña"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        minLength={6}
        placeholder="Repite la contraseña"
      />

      <button
        type="submit"
        disabled={pending}
        className="btn-terracotta inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold text-white transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-strong focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
