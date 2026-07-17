"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  signInWithEmail,
  signUpWithEmail,
  type EmailAuthState,
} from "@/app/login/actions";
import { AuthFormField, inputClassName } from "@/components/auth/AuthFormField";

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
      <div className="flex rounded-full border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
            mode === "signin"
              ? "btn-terracotta shadow-soft"
              : "text-muted hover:text-foreground"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
            mode === "signup"
              ? "btn-terracotta shadow-soft"
              : "text-muted hover:text-foreground"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p
          role="status"
          className="callout-sage text-sm text-foreground"
        >
          {state.message}
        </p>
      ) : null}

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
            <label htmlFor="auth-password" className="text-sm font-medium text-foreground">
              Contraseña
            </label>
            {mode === "signin" ? (
              <Link
                href="/login/forgot-password"
                className="text-xs font-medium text-sage-strong underline-offset-2 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            ) : null}
          </div>
          <input
            id="auth-password"
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={6}
            className={inputClassName}
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="btn-terracotta inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 py-3 text-base font-medium transition-all duration-200 hover:brightness-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 disabled:opacity-60"
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
