import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type Credentials = z.infer<typeof credentialsSchema>;

export const goalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give your Goal a title.")
    .max(200, "Keep the title under 200 characters."),
});

export type GoalInput = z.infer<typeof goalSchema>;

// A Task carries a description and a Gear (effort level 1–4). `gear` arrives as
// a string from form data, so coerce it before range-checking.
export const taskSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Describe the Task.")
    .max(500, "Keep the Task under 500 characters."),
  gear: z.coerce
    .number()
    .int("Pick a Gear from 1 to 4.")
    .min(1, "Pick a Gear from 1 to 4.")
    .max(4, "Pick a Gear from 1 to 4."),
});

export type TaskInput = z.infer<typeof taskSchema>;

// Editing a Task's description on its own (no Gear change).
export const taskDescriptionSchema = taskSchema.pick({ description: true });

// Changing a Task's Gear on its own (no description change).
export const taskGearSchema = taskSchema.pick({ gear: true });
