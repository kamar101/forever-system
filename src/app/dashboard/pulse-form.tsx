"use client";

import { useActionState } from "react";
import { takePulseAction } from "./actions";
import { CAPACITY_VALUES } from "@/lib/validation";
import type { FormState } from "./actions";

export function PulseForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    takePulseAction,
    undefined,
  );

  return (
    <form action={formAction} className="pulse-form">
      <fieldset disabled={isPending}>
        <legend>What&apos;s your Capacity today?</legend>
        <div className="capacity-options">
          {CAPACITY_VALUES.map((cap) => (
            <label key={cap} className="capacity-label">
              <input type="radio" name="capacity" value={cap} required />
              {cap}
            </label>
          ))}
        </div>
        <button type="submit">{isPending ? "Taking Pulse…" : "Take Pulse"}</button>
      </fieldset>
      {state && "error" in state && (
        <p className="error">{state.error}</p>
      )}
    </form>
  );
}
