"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AuthFormState } from "./actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="submit">
      {pending ? "…" : label}
    </button>
  );
}

export function AuthForm({
  action,
  submitLabel,
}: {
  action: (
    prev: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="auth-form">
      <label>
        Email
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </label>
      <label>
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
      </label>
      {state?.error ? (
        <p role="alert" className="error">
          {state.error}
        </p>
      ) : null}
      <SubmitButton label={submitLabel} />
    </form>
  );
}
