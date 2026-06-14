import Link from "next/link";
import { AuthForm } from "../auth-form";
import { signUpAction } from "../actions";

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <h1>Create your account</h1>
      <AuthForm action={signUpAction} submitLabel="Create account" />
      <p className="muted">
        Already have an account? <Link href="/sign-in">Sign in</Link>
      </p>
    </main>
  );
}
