"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { GEARS } from "@/domain/gear";
import { createTaskAction, type TaskFormState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="submit">
      {pending ? "…" : "Add Task"}
    </button>
  );
}

export function TaskForm({ goalId }: { goalId: string }) {
  const [state, formAction] = useActionState<TaskFormState, FormData>(
    createTaskAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the description after a Task is added; keep the chosen Gear.
  useEffect(() => {
    if (state && "ok" in state) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="task-form">
      <input type="hidden" name="goalId" value={goalId} />
      <label className="task-form-description">
        New Task
        <input
          type="text"
          name="description"
          required
          maxLength={500}
          placeholder="e.g. Watch 30 min of the course"
        />
      </label>
      <label className="task-form-gear">
        Gear
        <select name="gear" defaultValue={4}>
          {GEARS.map((gear) => (
            <option key={gear} value={gear}>
              Gear {gear}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton />
      {state && "error" in state ? (
        <p role="alert" className="error">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
