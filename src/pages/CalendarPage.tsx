import { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isWithinInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { TaskCard } from '../components/TaskCard';
import { FilterPanel } from '../components/FilterPanel';
import { cn } from '../utils/cn';

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { getFilteredTasks } = useTaskContext();

  const filteredTasks = getFilteredTasks();

  // Get the start of the week (Monday)
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);

  // Generate days of the week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Get tasks for a specific day
  const getTasksForDay = (day: Date) => {
    return filteredTasks.filter(task => {
      // Task spans this day if the day is between startDate and endDate
      return isWithinInterval(day, {
        start: new Date(task.startDate.setHours(0, 0, 0, 0)),
        end: new Date(task.endDate.setHours(23, 59, 59, 999)),
      });
    });
  };

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-violet-600" />
            <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              className="rounded-lg p-2 hover:bg-slate-100"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <button
              onClick={goToToday}
              className="rounded-lg bg-violet-100 px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-200"
            >
              Today
            </button>
            <button
              onClick={goToNextWeek}
              className="rounded-lg p-2 hover:bg-slate-100"
            >
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-slate-700">
            {format(weekStart, 'MMMM yyyy')}
          </span>
          <FilterPanel />
        </div>
      </div>

      {/* Week View */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Day Headers */}
          <div className="mb-2 grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={cn(
                  'rounded-lg p-3 text-center',
                  isToday(day) ? 'bg-violet-100' : 'bg-slate-50'
                )}
              >
                <div className={cn(
                  'text-xs font-medium uppercase tracking-wide',
                  isToday(day) ? 'text-violet-600' : 'text-slate-500'
                )}>
                  {format(day, 'EEE')}
                </div>
                <div className={cn(
                  'mt-1 text-2xl font-bold',
                  isToday(day) ? 'text-violet-700' : 'text-slate-700'
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Task Grid */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dayTasks = getTasksForDay(day);
              return (
                <div
                  key={index}
                  className={cn(
                    'min-h-[400px] rounded-xl border-2 p-3',
                    isToday(day)
                      ? 'border-violet-200 bg-violet-50/50'
                      : 'border-slate-100 bg-white'
                  )}
                >
                  <div className="space-y-2">
                    {dayTasks.map(task => (
                      <TaskCard key={task.id} task={task} compact />
                    ))}
                    {dayTasks.length === 0 && (
                      <div className="flex h-20 items-center justify-center text-xs text-slate-400">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Summary */}
      <div className="mt-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h3 className="mb-3 font-semibold text-slate-700">Week Summary</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-2xl font-bold text-slate-800">
              {filteredTasks.filter(t => 
                weekDays.some(day => isWithinInterval(day, {
                  start: new Date(t.startDate.setHours(0, 0, 0, 0)),
                  end: new Date(t.endDate.setHours(23, 59, 59, 999)),
                }))
              ).length}
            </div>
            <div className="text-sm text-slate-500">Total Tasks</div>
          </div>
          <div className="rounded-lg bg-blue-50 p-3">
            <div className="text-2xl font-bold text-blue-600">
              {filteredTasks.filter(t => t.status === 'in-progress' &&
                weekDays.some(day => isWithinInterval(day, {
                  start: new Date(t.startDate.setHours(0, 0, 0, 0)),
                  end: new Date(t.endDate.setHours(23, 59, 59, 999)),
                }))
              ).length}
            </div>
            <div className="text-sm text-slate-500">In Progress</div>
          </div>
          <div className="rounded-lg bg-amber-50 p-3">
            <div className="text-2xl font-bold text-amber-600">
              {filteredTasks.filter(t => t.status === 'review' &&
                weekDays.some(day => isWithinInterval(day, {
                  start: new Date(t.startDate.setHours(0, 0, 0, 0)),
                  end: new Date(t.endDate.setHours(23, 59, 59, 999)),
                }))
              ).length}
            </div>
            <div className="text-sm text-slate-500">In Review</div>
          </div>
          <div className="rounded-lg bg-green-50 p-3">
            <div className="text-2xl font-bold text-green-600">
              {filteredTasks.filter(t => t.status === 'done' &&
                weekDays.some(day => isWithinInterval(day, {
                  start: new Date(t.startDate.setHours(0, 0, 0, 0)),
                  end: new Date(t.endDate.setHours(23, 59, 59, 999)),
                }))
              ).length}
            </div>
            <div className="text-sm text-slate-500">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
