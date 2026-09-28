"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import type { Task } from "@/types/api";
import { TaskEditorModal } from "./task-editor-modal";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null | undefined>(undefined);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const data = await apiClient.get<{ data: Task[] }>("/tasks?status=open");
      setTasks(data.data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(task: Task) {
    try {
      await apiClient.patch(`/tasks/${task.id}`, { status: "done" });
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  }

  async function handleDelete(taskId: string) {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  }

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{tasks.length} open tasks</p>
        <button id="add-task-btn" onClick={() => setEditingTask(null)} className="btn-primary text-sm py-2 px-4">
          + Add task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No open tasks</h3>
          <p className="text-sm text-muted-foreground mb-4">Add tasks so the AI can factor them into suggestions.</p>
          <button onClick={() => setEditingTask(null)} className="btn-primary text-sm">Add your first task</button>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} id={`task-${task.id}`} className="card p-4 flex items-start gap-4 group hover:border-primary/20 transition-colors">
              <button
                onClick={() => handleComplete(task)}
                className="w-5 h-5 rounded border border-border flex-shrink-0 mt-0.5 hover:border-success hover:bg-success/10 transition-colors"
                title="Mark complete"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                {task.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{task.notes}</p>}
                <div className="flex items-center gap-3 mt-2">
                  {task.estimatedMinutes && (
                    <span className="text-xs text-muted-foreground">~{task.estimatedMinutes}m</span>
                  )}
                  {task.dueAt && (
                    <span className="text-xs text-muted-foreground">
                      Due {new Date(task.dueAt).toLocaleDateString()}
                    </span>
                  )}
                  {task.source !== "native" && (
                    <span className="badge text-xs border border-border text-muted-foreground">{task.source}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingTask(task)} className="btn-ghost p-1.5 text-xs">✏️</button>
                <button onClick={() => handleDelete(task.id)} className="btn-ghost p-1.5 text-xs text-destructive">🗑</button>
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
            setTasks((prev) =>
              editingTask
                ? prev.map((t) => (t.id === saved.id ? saved : t))
                : [saved, ...prev]
            );
            setEditingTask(undefined);
          }}
        />
      )}
    </>
  );
}
