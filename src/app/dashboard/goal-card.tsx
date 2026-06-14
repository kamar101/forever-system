import { groupTasksByGear, isGear, type Gear } from "@/domain/gear";
import { TaskForm } from "./task-form";
import { TaskItem, type TaskView } from "./task-item";

// Gear 4 is the best day, Gear 1 the worst-day safety net (see CONTEXT.md).
const GEAR_HINT: Record<Gear, string> = {
  4: "best day",
  3: "",
  2: "",
  1: "safety net",
};

export type GoalCardProps = {
  goal: { id: string; title: string };
  tasks: { id: string; description: string; gear: number }[];
};

export function GoalCard({ goal, tasks }: GoalCardProps) {
  // Defensively narrow the persisted Int to a Gear before grouping.
  const views: TaskView[] = tasks
    .filter((t): t is TaskView => isGear(t.gear))
    .map((t) => ({ id: t.id, description: t.description, gear: t.gear }));
  const groups = groupTasksByGear(views).filter((g) => g.tasks.length > 0);

  return (
    <li className="goal-item">
      <h3 className="goal-title">{goal.title}</h3>

      {groups.length === 0 ? (
        <p className="muted">No Tasks yet. Add one below.</p>
      ) : (
        <div className="gear-groups">
          {groups.map(({ gear, tasks }) => (
            <div key={gear} className="gear-group">
              <h4 className="gear-heading">
                Gear {gear}
                {GEAR_HINT[gear] ? (
                  <span className="muted"> — {GEAR_HINT[gear]}</span>
                ) : null}
              </h4>
              <ul className="task-list">
                {tasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <TaskForm goalId={goal.id} />
    </li>
  );
}
