import { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { TaskStatus, TaskPriority } from '../types';
import { cn } from '../utils/cn';

const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'todo', label: 'To Do', color: 'bg-slate-500' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'review', label: 'Review', color: 'bg-amber-500' },
  { value: 'done', label: 'Done', color: 'bg-green-500' },
];

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-slate-400' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-400' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
];

export function FilterPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { filters, setFilters, clearFilters, users, tags } = useTaskContext();

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.assignee.length > 0 ||
    filters.tags.length > 0;

  const toggleStatus = (status: TaskStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    setFilters({ ...filters, status: newStatus });
  };

  const togglePriority = (priority: TaskPriority) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority];
    setFilters({ ...filters, priority: newPriority });
  };

  const toggleAssignee = (userId: string) => {
    const newAssignee = filters.assignee.includes(userId)
      ? filters.assignee.filter(a => a !== userId)
      : [...filters.assignee, userId];
    setFilters({ ...filters, assignee: newAssignee });
  };

  const toggleTag = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(t => t !== tagId)
      : [...filters.tags, tagId];
    setFilters({ ...filters, tags: newTags });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
          hasActiveFilters
            ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-300'
            : 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50'
        )}
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-xs text-white">
            {filters.status.length + filters.priority.length + filters.assignee.length + filters.tags.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl bg-white p-4 shadow-xl ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Filters</h3>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1 hover:bg-slate-100"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => toggleStatus(value)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                      filters.status.includes(value)
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    <span className={cn('h-2 w-2 rounded-full', color)} />
                    {label}
                    {filters.status.includes(value) && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => togglePriority(value)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                      filters.priority.includes(value)
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    <span className={cn('h-2 w-2 rounded-full', color)} />
                    {label}
                    {filters.priority.includes(value) && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignees */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Assignees
              </label>
              <div className="flex flex-wrap gap-2">
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => toggleAssignee(user.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                      filters.assignee.includes(user.id)
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] text-white"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.avatar}
                    </span>
                    {user.name.split(' ')[0]}
                    {filters.assignee.includes(user.id) && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                      filters.tags.includes(tag.id)
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                    {filters.tags.includes(tag.id) && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
