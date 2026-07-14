"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  signInWithEmail,
  signUpWithEmail,
  type EmailAuthState,
} from "@/app/login/actions";
import { AuthFormField } from "@/components/auth/AuthFormField";

interface EmailAuthFormProps {
  nextPath: string;
}

const initialState: EmailAuthState = {};

export function EmailAuthForm({ nextPath }: EmailAuthFormProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction, signInPending] = useActionState(
    signInWithEmail,
    initialState,
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUpWithEmail,
    initialState,
  );

  const state = mode === "signin" ? signInState : signUpState;
  const action = mode === "signin" ? signInAction : signUpAction;
  const pending = signInPending || signUpPending;

  return (
    <div className="space-y-4 text-left">
      <div className="flex rounded-xl border border-gray-200 p-1">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            mode === "signin"
              ? "bg-emerald-600 text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            mode === "signup"
              ? "bg-emerald-600 text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Crear cuenta
        </button>
      </div>

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

      <form action={action} className="space-y-3">
        <input type="hidden" name="next" value={nextPath} />
        <AuthFormField
          id="auth-email"
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
        />
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="auth-password" className="text-sm font-medium text-gray-700">
              Contraseña
            </label>
            {mode === "signin" && (
              <Link
                href="/login/forgot-password"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            )}
          </div>
          <input
            id="auth-password"
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={6}
            className="w-full rounded-xl border border-emerald-200 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {pending
            ? "Procesando…"
            : mode === "signin"
              ? "Entrar con correo"
              : "Crear cuenta con correo"}
        </button>
      </form>
    </div>
  );
}
