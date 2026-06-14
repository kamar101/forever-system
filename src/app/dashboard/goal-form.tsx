"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createGoalAction, type GoalFormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="submit">
      {pending ? "…" : "Add to Vault"}
    </button>
  );
}

export function GoalForm() {
  const [state, formAction] = useActionState<GoalFormState, FormData>(
    createGoalAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the title after a Goal is successfully added.
  useEffect(() => {
    if (state && "ok" in state) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="goal-form">
      <label>
        New Goal
        <input
          type="text"
          name="title"
          required
          maxLength={200}
          placeholder="e.g. Complete a Udemy course"
        />
      </label>
      {state && "error" in state ? (
        <p role="alert" className="error">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
