import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canActivateGoal, MAX_ACTIVE_GOALS } from "@/domain/goal";
import { signOutAction } from "../(auth)/actions";
import { ActiveGoalCard } from "./active-goal-card";
import { GoalCard } from "./goal-card";
import { GoalForm } from "./goal-form";
import { PulseForm } from "./pulse-form";

export default async function DashboardPage() {
  const session = await auth();
  // Middleware already guards this route; this is defense-in-depth and gives us
  // the typed session for scoping.
  if (!session?.user) redirect("/sign-in");

  const userId = session.user.id;

  // Today's Assignment (if a Pulse has been taken today).
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayPulse = await prisma.pulse.findUnique({
    where: { userId_date: { userId, date: today } },
    include: {
      assignment: {
        include: {
          items: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  // Active Goals ordered by priority rank (1 = highest).
  const activeGoals = await prisma.goal.findMany({
    where: { userId, status: "active" },
    orderBy: { rank: "asc" },
    include: { tasks: { orderBy: { createdAt: "asc" } } },
  });

  // The Vault: dormant Goals, newest first.
  const vaultGoals = await prisma.goal.findMany({
    where: { userId, status: "vault" },
    orderBy: { createdAt: "desc" },
    include: { tasks: { orderBy: { createdAt: "asc" } } },
  });

  const atCap = activeGoals.length >= MAX_ACTIVE_GOALS;

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

      <section className="pulse-section" aria-label="Today's Assignment">
        <h2>Today&apos;s Assignment</h2>
        {activeGoals.length === 0 ? (
          <p className="muted">Activate a Goal first to take a Pulse.</p>
        ) : todayPulse?.assignment ? (
          <div className="assignment">
            <p className="muted">
              Capacity: <strong>{todayPulse.capacity}</strong>
            </p>
            {todayPulse.assignment.items.length === 0 ? (
              <p className="muted">
                No Tasks at that Gear — re-Pulse or add Tasks.
              </p>
            ) : (
              <ul className="assignment-items">
                {todayPulse.assignment.items.map((item) => (
                  <li key={item.id} className="assignment-item">
                    <span>{item.taskDescription}</span>
                    <span className="gear-badge">G{item.gear}</span>
                  </li>
                ))}
              </ul>
            )}
            <details>
              <summary className="muted">Re-Pulse</summary>
              <PulseForm />
            </details>
          </div>
        ) : (
          <PulseForm />
        )}
      </section>

      <section className="active-goals" aria-label="Active Goals">
        <h2>Active Goals</h2>
        {activeGoals.length === 0 ? (
          <p className="muted">No active Goals yet.</p>
        ) : (
          <ul className="goal-list">
            {activeGoals.map((goal, i) => (
              <ActiveGoalCard
                key={goal.id}
                goal={{ id: goal.id, title: goal.title, rank: goal.rank! }}
                tasks={goal.tasks}
                isFirst={i === 0}
                isLast={i === activeGoals.length - 1}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="vault">
        <h2>Vault</h2>
        <GoalForm />
        {vaultGoals.length === 0 ? (
          <p className="muted">Your Vault is empty.</p>
        ) : (
          <ul className="goal-list">
            {vaultGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                tasks={goal.tasks}
                canActivate={canActivateGoal(goal)}
                atCap={atCap}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
