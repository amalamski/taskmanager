import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { FilterPanel } from '../components/FilterPanel';
import { TaskStatus } from '../types';
import { cn } from '../utils/cn';

const columns: { status: TaskStatus; title: string; color: string; bgColor: string }[] = [
  { status: 'todo', title: 'To Do', color: 'bg-slate-500', bgColor: 'bg-slate-50' },
  { status: 'in-progress', title: 'In Progress', color: 'bg-blue-500', bgColor: 'bg-blue-50' },
  { status: 'review', title: 'Review', color: 'bg-amber-500', bgColor: 'bg-amber-50' },
  { status: 'done', title: 'Done', color: 'bg-green-500', bgColor: 'bg-green-50' },
];

export function BoardPage() {
  const { getFilteredTasks, moveTask } = useTaskContext();
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const filteredTasks = getFilteredTasks();

  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTaskId) {
      moveTask(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    setNewTaskStatus(status);
    setShowNewTaskModal(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Board</h1>
          <p className="text-sm text-slate-500">Manage your tasks across different stages</p>
        </div>
        <div className="flex items-center gap-3">
          <FilterPanel />
          <button
            onClick={() => handleAddTask('todo')}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {columns.map(({ status, title, color, bgColor }) => {
          const tasks = getTasksByStatus(status);
          return (
            <div
              key={status}
              className={cn('min-h-[500px] rounded-xl p-4', bgColor)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(status)}
            >
              {/* Column Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn('h-3 w-3 rounded-full', color)} />
                  <h2 className="font-semibold text-slate-700">{title}</h2>
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-200 px-1.5 text-xs font-medium text-slate-600">
                    {tasks.length}
                  </span>
                </div>
                <button
                  onClick={() => handleAddTask(status)}
                  className="rounded-md p-1.5 hover:bg-white/50"
                >
                  <Plus className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <TaskCard task={task} />
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-sm text-slate-400">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <TaskModal
          onClose={() => setShowNewTaskModal(false)}
          initialStatus={newTaskStatus}
        />
      )}
    </div>
  );
}
