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
