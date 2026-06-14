import Link from "next/link";
import { AuthForm } from "../auth-form";
import { signInAction } from "../actions";

export default function SignInPage() {
  return (
    <main className="auth-page">
      <h1>Sign in</h1>
      <AuthForm action={signInAction} submitLabel="Sign in" />
      <p className="muted">
        No account? <Link href="/sign-up">Create one</Link>
      </p>
    </main>
  );
}
