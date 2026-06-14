import { groupTasksByGear, isGear, type Gear } from "@/domain/gear";
import { deactivateGoalAction, moveGoalRankDownAction, moveGoalRankUpAction } from "./actions";
import { TaskItem, type TaskView } from "./task-item";

const GEAR_HINT: Record<Gear, string> = {
  4: "best day",
  3: "",
  2: "",
  1: "safety net",
};

export type ActiveGoalCardProps = {
  goal: { id: string; title: string; rank: number };
  tasks: { id: string; description: string; gear: number }[];
  isFirst: boolean;
  isLast: boolean;
};

export function ActiveGoalCard({ goal, tasks, isFirst, isLast }: ActiveGoalCardProps) {
  const views: TaskView[] = tasks
    .filter((t): t is TaskView => isGear(t.gear))
    .map((t) => ({ id: t.id, description: t.description, gear: t.gear }));
  const groups = groupTasksByGear(views).filter((g) => g.tasks.length > 0);

  return (
    <li className="goal-item active-goal-item">
      <div className="goal-header">
        <span className="goal-rank">#{goal.rank}</span>
        <h3 className="goal-title">{goal.title}</h3>
        <div className="goal-rank-controls">
          <form action={moveGoalRankUpAction}>
            <input type="hidden" name="goalId" value={goal.id} />
            <button type="submit" disabled={isFirst} aria-label="Move Up">
              Move Up
            </button>
          </form>
          <form action={moveGoalRankDownAction}>
            <input type="hidden" name="goalId" value={goal.id} />
            <button type="submit" disabled={isLast} aria-label="Move Down">
              Move Down
            </button>
          </form>
        </div>
        <form action={deactivateGoalAction}>
          <input type="hidden" name="goalId" value={goal.id} />
          <button type="submit" className="deactivate-button">
            Deactivate
          </button>
        </form>
      </div>

      {groups.length === 0 ? (
        <p className="muted">No Tasks yet.</p>
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
    </li>
  );
}
