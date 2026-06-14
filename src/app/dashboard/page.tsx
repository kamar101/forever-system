import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { signOutAction } from "../(auth)/actions";
import { GoalForm } from "./goal-form";

export default async function DashboardPage() {
  const session = await auth();
  // Middleware already guards this route; this is defense-in-depth and gives us
  // the typed session for scoping.
  if (!session?.user) redirect("/sign-in");

  // The Vault is this user's dormant Goals, newest first.
  const vaultGoals = await prisma.goal.findMany({
    where: { userId: session.user.id, status: "vault" },
    orderBy: { createdAt: "desc" },
  });

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

      <section className="vault">
        <h2>Vault</h2>
        <GoalForm />
        {vaultGoals.length === 0 ? (
          <p className="muted">
            Your Vault is empty. Add a Goal to get started.
          </p>
        ) : (
          <ul className="goal-list">
            {vaultGoals.map((goal) => (
              <li key={goal.id} className="goal-item">
                {goal.title}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
