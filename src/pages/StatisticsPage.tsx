import { useMemo } from 'react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { BarChart3, TrendingUp, CheckCircle2, Clock, Users, Tag } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { cn } from '../utils/cn';

const statusColors: Record<string, string> = {
  todo: '#64748B',
  'in-progress': '#3B82F6',
  review: '#F59E0B',
  done: '#10B981',
};

const priorityColors: Record<string, string> = {
  low: '#94A3B8',
  medium: '#F59E0B',
  high: '#EF4444',
};

export function StatisticsPage() {
  const { tasks, users, tags } = useTaskContext();

  // Calculate statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const inReview = tasks.filter(t => t.status === 'review').length;
    const todo = tasks.filter(t => t.status === 'todo').length;

    const byPriority = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Tasks by assignee
    const byAssignee = users.map(user => ({
      user,
      total: tasks.filter(t => t.assignee?.id === user.id).length,
      completed: tasks.filter(t => t.assignee?.id === user.id && t.status === 'done').length,
    }));

    // Tasks by tag
    const byTag = tags.map(tag => ({
      tag,
      count: tasks.filter(t => t.tags.some(tt => tt.id === tag.id)).length,
    })).sort((a, b) => b.count - a.count);

    // Weekly completion trend (last 7 days)
    const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const completedOnDay = tasks.filter(t => 
        t.completedAt && isWithinInterval(t.completedAt, {
          start: startOfDay(date),
          end: endOfDay(date),
        })
      ).length;
      return {
        date: format(date, 'EEE'),
        completed: completedOnDay,
      };
    });

    const maxWeeklyCompleted = Math.max(...weeklyTrend.map(d => d.completed), 1);

    // Average completion time (in days)
    const completedTasks = tasks.filter(t => t.status === 'done' && t.completedAt);
    const avgCompletionTime = completedTasks.length > 0
      ? Math.round(
          completedTasks.reduce((acc, t) => {
            const duration = (t.completedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return acc + duration;
          }, 0) / completedTasks.length
        )
      : 0;

    return {
      total,
      completed,
      inProgress,
      inReview,
      todo,
      byPriority,
      completionRate,
      byAssignee,
      byTag,
      weeklyTrend,
      maxWeeklyCompleted,
      avgCompletionTime,
    };
  }, [tasks, users, tags]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-violet-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Statistics</h1>
          <p className="text-sm text-slate-500">Track your task performance and productivity</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Tasks</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
              <BarChart3 className="h-6 w-6 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Completed</p>
              <p className="mt-1 text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Completion Rate</p>
              <p className="mt-1 text-3xl font-bold text-violet-600">{stats.completionRate}%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
              <TrendingUp className="h-6 w-6 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Avg. Completion</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{stats.avgCompletionTime}d</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 font-semibold text-slate-700">Status Distribution</h3>
          <div className="space-y-4">
            {[
              { label: 'To Do', value: stats.todo, color: statusColors.todo },
              { label: 'In Progress', value: stats.inProgress, color: statusColors['in-progress'] },
              { label: 'Review', value: stats.inReview, color: statusColors.review },
              { label: 'Done', value: stats.completed, color: statusColors.done },
            ].map(item => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-medium text-slate-800">{item.value}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: stats.total > 0 ? `${(item.value / stats.total) * 100}%` : '0%',
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 font-semibold text-slate-700">Priority Breakdown</h3>
          <div className="flex h-48 items-end justify-center gap-8">
            {[
              { label: 'Low', value: stats.byPriority.low, color: priorityColors.low },
              { label: 'Medium', value: stats.byPriority.medium, color: priorityColors.medium },
              { label: 'High', value: stats.byPriority.high, color: priorityColors.high },
            ].map(item => {
              const maxPriority = Math.max(stats.byPriority.low, stats.byPriority.medium, stats.byPriority.high, 1);
              const height = (item.value / maxPriority) * 140;
              return (
                <div key={item.label} className="flex flex-col items-center">
                  <span className="mb-2 text-sm font-medium text-slate-700">{item.value}</span>
                  <div
                    className="w-16 rounded-t-lg transition-all duration-500"
                    style={{
                      height: Math.max(height, 8),
                      backgroundColor: item.color,
                    }}
                  />
                  <span className="mt-2 text-sm text-slate-500">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Completion Trend */}
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 font-semibold text-slate-700">Weekly Completion Trend</h3>
          <div className="flex h-48 items-end justify-around gap-2">
            {stats.weeklyTrend.map((day, index) => {
              const height = (day.completed / stats.maxWeeklyCompleted) * 140;
              const isToday = index === 6;
              return (
                <div key={index} className="flex flex-col items-center">
                  <span className={cn(
                    'mb-2 text-sm font-medium',
                    isToday ? 'text-violet-600' : 'text-slate-700'
                  )}>
                    {day.completed}
                  </span>
                  <div
                    className={cn(
                      'w-10 rounded-t-lg transition-all duration-500',
                      isToday ? 'bg-violet-500' : 'bg-slate-300'
                    )}
                    style={{ height: Math.max(height, 8) }}
                  />
                  <span className={cn(
                    'mt-2 text-xs',
                    isToday ? 'font-medium text-violet-600' : 'text-slate-500'
                  )}>
                    {day.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Performance */}
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-400" />
            <h3 className="font-semibold text-slate-700">Team Performance</h3>
          </div>
          <div className="space-y-4">
            {stats.byAssignee.map(({ user, total, completed }) => (
              <div key={user.id} className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: user.color }}
                >
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{user.name}</span>
                    <span className="text-slate-500">
                      {completed}/{total} done
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: total > 0 ? `${(completed / total) * 100}%` : '0%',
                        backgroundColor: user.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags Usage */}
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5 text-slate-400" />
            <h3 className="font-semibold text-slate-700">Tags Usage</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {stats.byTag.map(({ tag, count }) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/20 px-1.5 text-xs">
                  {count}
                </span>
              </div>
            ))}
            {stats.byTag.length === 0 && (
              <p className="text-sm text-slate-400">No tags used yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
