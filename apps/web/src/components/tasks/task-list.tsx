"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import type { Task } from "@/types/api";
import { TaskEditorModal } from "./task-editor-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ApiErrorState } from "@/components/ui/api-error-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null | undefined>(undefined);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setError(null);
    try {
      const data = await apiClient.get<{ data: Task[] }>("/tasks?status=open");
      setTasks(data.data);
    } catch (err: any) {
      setError(err.message ?? "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(task: Task) {
    setCompletingId(task.id);
    try {
      await apiClient.patch(`/tasks/${task.id}`, { status: "done" });
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      success(`"${task.title}" marked complete ✓`);
    } catch (err: any) {
      showError("Failed to complete task. Please try again.");
    } finally {
      setCompletingId(null);
    }
  }

  async function handleDelete(task: Task) {
    try {
      await apiClient.delete(`/tasks/${task.id}`);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      success("Task deleted");
    } catch (err: any) {
      showError("Failed to delete task");
    }
  }

  if (loading) {
    return <SkeletonList count={4} lines={2} />;
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={loadTasks} />;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {tasks.length} open task{tasks.length !== 1 ? "s" : ""}
        </p>
        <button
          id="add-task-btn"
          onClick={() => setEditingTask(null)}
          className="btn-primary text-sm py-2 px-4"
          aria-label="Add a new task"
        >
          + Add task
        </button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon="✅"
          title="No open tasks"
          description="Add tasks so the AI knows what's on your plate and can factor them into suggestions."
          actionLabel="Add your first task"
          onAction={() => setEditingTask(null)}
          secondaryLabel="Go to dashboard"
          secondaryHref="/app"
        />
      ) : (
        <div className="space-y-2" role="list" aria-label="Open tasks">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              id={`task-${task.id}`}
              role="listitem"
              className={`card p-4 flex items-start gap-4 group hover:border-primary/20 transition-all duration-200
                ${completingId === task.id ? "opacity-50 scale-[0.98]" : ""}
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Complete checkbox */}
              <button
                onClick={() => handleComplete(task)}
                disabled={completingId === task.id}
                className="w-5 h-5 rounded border border-border flex-shrink-0 mt-0.5
                  hover:border-success hover:bg-success/10
                  focus-visible:border-success focus-visible:bg-success/10
                  transition-colors disabled:opacity-50"
                title="Mark complete"
                aria-label={`Mark "${task.title}" as complete`}
              />

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                {task.notes && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{task.notes}</p>
                )}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {task.estimatedMinutes && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ~{task.estimatedMinutes}m
                    </span>
                  )}
                  {task.dueAt && (
                    <span className={`text-xs flex items-center gap-1 ${
                      new Date(task.dueAt) < new Date() ? "text-destructive" : "text-muted-foreground"
                    }`}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {new Date(task.dueAt) < new Date() ? "Overdue · " : "Due "}
                      {new Date(task.dueAt).toLocaleDateString()}
                    </span>
                  )}
                  {task.source !== "native" && (
                    <span className="badge text-xs border border-border text-muted-foreground">{task.source}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingTask(task)}
                  className="btn-ghost p-1.5 text-xs"
                  aria-label={`Edit "${task.title}"`}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(task)}
                  className="btn-ghost p-1.5 text-xs text-destructive"
                  aria-label={`Delete "${task.title}"`}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingTask !== undefined && (
        <TaskEditorModal
          task={editingTask}
          onClose={() => setEditingTask(undefined)}
          onSave={(saved) => {
            const isNew = !editingTask;
            setTasks((prev) =>
              editingTask
                ? prev.map((t) => (t.id === saved.id ? saved : t))
                : [saved, ...prev]
            );
            setEditingTask(undefined);
            success(isNew ? `Task "${saved.title}" created` : `Task updated`);
          }}
        />
      )}
    </>
  );
}
