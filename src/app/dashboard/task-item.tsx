"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { GEARS, type Gear } from "@/domain/gear";
import {
  deleteTaskAction,
  updateTaskDescriptionAction,
  updateTaskGearAction,
  type TaskFormState,
} from "./actions";

export type TaskView = { id: string; description: string; gear: Gear };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="task-save">
      {pending ? "…" : "Save"}
    </button>
  );
}

export function TaskItem({ task }: { task: TaskView }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState<TaskFormState, FormData>(
    updateTaskDescriptionAction,
    undefined,
  );

  // Leave edit mode once the description saves successfully.
  useEffect(() => {
    if (state && "ok" in state) setEditing(false);
  }, [state]);

  return (
    <li className="task-item">
      {editing ? (
        <form action={formAction} className="task-edit">
          <input type="hidden" name="taskId" value={task.id} />
          <input
            type="text"
            name="description"
            defaultValue={task.description}
            required
            maxLength={500}
            aria-label="Task description"
            autoFocus
          />
          <SaveButton />
          <button
            type="button"
            className="link-button"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
          {state && "error" in state ? (
            <span role="alert" className="error">
              {state.error}
            </span>
          ) : null}
        </form>
      ) : (
        <span className="task-description">{task.description}</span>
      )}

      {/* Change Gear: a one-field form that submits as soon as the value changes. */}
      <form action={updateTaskGearAction} className="task-gear">
        <input type="hidden" name="taskId" value={task.id} />
        <label className="visually-hidden" htmlFor={`gear-${task.id}`}>
          Gear for {task.description}
        </label>
        <select
          id={`gear-${task.id}`}
          name="gear"
          defaultValue={task.gear}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        >
          {GEARS.map((gear) => (
            <option key={gear} value={gear}>
              Gear {gear}
            </option>
          ))}
        </select>
      </form>

      {!editing ? (
        <button
          type="button"
          className="link-button"
          onClick={() => setEditing(true)}
        >
          Edit
        </button>
      ) : null}

      <form action={deleteTaskAction} className="task-delete">
        <input type="hidden" name="taskId" value={task.id} />
        <DeleteButton />
      </form>
    </li>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="link-button danger"
      aria-label="Delete Task"
    >
      Delete
    </button>
  );
}
