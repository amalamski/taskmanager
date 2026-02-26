import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, MoreVertical, Edit2, Trash2, Clock } from 'lucide-react';
import { Task } from '../types';
import { cn } from '../utils/cn';
import { useTaskContext } from '../context/TaskContext';
import { TaskModal } from './TaskModal';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

const priorityColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { deleteTask } = useTaskContext();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
    setShowMenu(false);
  };

  if (compact) {
    return (
      <>
        <div
          className="group cursor-pointer rounded-md border-l-4 bg-white p-2 shadow-sm transition-all hover:shadow-md"
          style={{ borderLeftColor: task.color }}
          onClick={() => setShowEditModal(true)}
        >
          <p className="text-xs font-medium text-slate-800 line-clamp-2">{task.title}</p>
          {task.assignee && (
            <div className="mt-1 flex items-center gap-1">
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] text-white"
                style={{ backgroundColor: task.assignee.color }}
              >
                {task.assignee.avatar}
              </span>
            </div>
          )}
        </div>
        {showEditModal && (
          <TaskModal task={task} onClose={() => setShowEditModal(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div
        className="group relative rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-slate-300"
        style={{ borderTop: `3px solid ${task.color}` }}
      >
        {/* Menu Button */}
        <div className="absolute right-2 top-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-md p-1 opacity-0 transition-opacity hover:bg-slate-100 group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4 text-slate-400" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-lg bg-white py-1 shadow-lg ring-1 ring-slate-200">
                <button
                  onClick={() => {
                    setShowEditModal(true);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>

        {/* Priority Badge */}
        <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', priorityColors[task.priority])}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>

        {/* Title */}
        <h4 className="mt-2 font-semibold text-slate-900">{task.title}</h4>

        {/* Description */}
        {task.description && (
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">{task.description}</p>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {task.tags.map(tag => (
              <span
                key={tag.id}
                className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(task.startDate, 'MMM d')}</span>
            <span>-</span>
            <span>{format(task.endDate, 'MMM d')}</span>
          </div>

          {task.assignee && (
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: task.assignee.color }}
              title={task.assignee.name}
            >
              {task.assignee.avatar}
            </div>
          )}
        </div>

        {task.status === 'done' && task.completedAt && (
          <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
            <Clock className="h-3.5 w-3.5" />
            <span>Completed {format(task.completedAt, 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>

      {showEditModal && (
        <TaskModal task={task} onClose={() => setShowEditModal(false)} />
      )}
    </>
  );
}
