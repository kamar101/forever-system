import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { signOutAction } from "../(auth)/actions";

export default async function DashboardPage() {
  const session = await auth();
  // Middleware already guards this route; this is defense-in-depth and gives us
  // the typed session for scoping.
  if (!session?.user) redirect("/sign-in");

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Your Day</h1>
          <p className="muted">Signed in as {session.user.email}</p>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="link-button">
            Sign out
          </button>
        </form>
      </header>

      <section className="empty-state">
        <p>Nothing here yet.</p>
        <p className="muted">
          Your Vault is empty. Goals, Tasks, and your daily Assignment will show
          up here as you build the system out.
        </p>
      </section>
    </main>
  );
}
