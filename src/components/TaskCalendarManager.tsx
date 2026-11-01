import React, { useState } from 'react';
import { TaskItem, CalendarEvent, Reminder, JarvisState, PriorityLevel } from '../types';
import { CheckSquare, Calendar, Bell, Plus, Trash2, Clock, MapPin, Tag } from 'lucide-react';
import { playChime } from '../utils/speech';

interface TaskCalendarManagerProps {
  state: JarvisState;
  onUpdateState: (newState: Partial<JarvisState>) => Promise<void>;
}

export const TaskCalendarManager: React.FC<TaskCalendarManagerProps> = ({ state, onUpdateState }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar' | 'reminders'>('tasks');

  // Task creation state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('medium');
  const [taskCategory, setTaskCategory] = useState('General');

  // Calendar event creation state
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('11:00 AM');
  const [eventDate, setEventDate] = useState('Today');
  const [eventLocation, setEventLocation] = useState('');

  // Reminder creation state
  const [reminderTitle, setReminderTitle] = useState('');
  const [isLocationBased, setIsLocationBased] = useState(false);
  const [reminderLocation, setReminderLocation] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00 AM');

  // Task Handlers
  const toggleTask = async (id: string) => {
    playChime('affirm');
    const updated = state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    await onUpdateState({ tasks: updated });
  };

  const deleteTask = async (id: string) => {
    const updated = state.tasks.filter((t) => t.id !== id);
    await onUpdateState({ tasks: updated });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      priority: taskPriority,
      category: taskCategory,
      completed: false,
      dueDate: 'Today'
    };

    await onUpdateState({ tasks: [newTask, ...state.tasks] });
    setTaskTitle('');
    playChime('wake');
  };

  // Calendar Handlers
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: eventTitle.trim(),
      time: eventTime,
      date: eventDate,
      location: eventLocation.trim() || undefined
    };

    await onUpdateState({ events: [...state.events, newEvt] });
    setEventTitle('');
    setEventLocation('');
    playChime('wake');
  };

  const deleteEvent = async (id: string) => {
    const updated = state.events.filter((e) => e.id !== id);
    await onUpdateState({ events: updated });
  };

  // Reminder Handlers
  const toggleReminder = async (id: string) => {
    playChime('affirm');
    const updated = state.reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r));
    await onUpdateState({ reminders: updated });
  };

  const deleteReminder = async (id: string) => {
    const updated = state.reminders.filter((r) => r.id !== id);
    await onUpdateState({ reminders: updated });
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim()) return;

    const newRem: Reminder = {
      id: `rem-${Date.now()}`,
      title: reminderTitle.trim(),
      time: isLocationBased ? undefined : reminderTime,
      locationBased: isLocationBased,
      locationName: isLocationBased ? reminderLocation.trim() : undefined,
      completed: false
    };

    await onUpdateState({ reminders: [newRem, ...state.reminders] });
    setReminderTitle('');
    setReminderLocation('');
    playChime('wake');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>ORGANIZATIONAL PROTOCOLS & TIME MANAGEMENT</span>
          </div>
          <h2 className="text-2xl font-bold text-cyan-100 font-sans tracking-wide">
            Productivity Matrix
          </h2>
          <p className="text-sm text-cyan-300/70 mt-1">
            Manage your prioritized to-dos, synchronized schedule, and contextual alerts.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-cyan-900/60 rounded-2xl font-mono text-xs">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'tasks'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>To-Do ({state.tasks.filter(t => !t.completed).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'calendar'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule ({state.events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'reminders'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Reminders ({state.reminders.filter(r => !r.completed).length})</span>
          </button>
        </div>
      </div>

      {/* Tab: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Quick Add Form */}
          <form
            onSubmit={handleAddTask}
            className="p-4 bg-slate-900/80 border border-cyan-500/20 rounded-2xl flex flex-col md:flex-row items-center gap-3"
          >
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Add prioritized action item..."
              className="flex-1 bg-slate-950 text-cyan-100 placeholder:text-slate-500 border border-cyan-900/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-400 font-sans"
            />

            <select
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as any)}
              className="bg-slate-950 text-cyan-200 border border-cyan-900/60 rounded-xl px-3 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <input
              type="text"
              value={taskCategory}
              onChange={(e) => setTaskCategory(e.target.value)}
              placeholder="Category"
              className="w-32 bg-slate-950 text-cyan-200 border border-cyan-900/60 rounded-xl px-3 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
            />

            <button
              type="submit"
              className="w-full md:w-auto px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Plus className="w-4 h-4" />
              <span>Log Task</span>
            </button>
          </form>

          {/* Tasks List */}
          <div className="space-y-3">
            {state.tasks.map((task) => {
              const priorityColors = {
                high: 'border-rose-500/40 text-rose-400 bg-rose-950/20',
                medium: 'border-amber-500/40 text-amber-400 bg-amber-950/20',
                low: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20'
              }[task.priority];

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border backdrop-blur-xl flex items-center justify-between gap-4 transition-all ${
                    task.completed
                      ? 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                      : 'bg-slate-900/70 border-cyan-500/20 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-5 h-5 rounded accent-cyan-400 cursor-pointer"
                    />

                    <div>
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-cyan-100'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${priorityColors}`}>
                          {task.priority} Priority
                        </span>
                        {task.category && (
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {task.category}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-[10px] font-mono text-cyan-400/60">
                            Due: {task.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Calendar */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* Add Event Form */}
          <form
            onSubmit={handleAddEvent}
            className="p-4 bg-slate-900/80 border border-cyan-500/20 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3"
          >
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Event Title..."
              required
              className="bg-slate-950 text-cyan-100 border border-cyan-900/60 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-400 focus:outline-none"
            />
            <input
              type="text"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              placeholder="e.g. 02:00 PM - 03:00 PM"
              required
              className="bg-slate-950 text-cyan-100 border border-cyan-900/60 rounded-xl px-3 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
            />
            <input
              type="text"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="Location (Optional)"
              className="bg-slate-950 text-cyan-100 border border-cyan-900/60 rounded-xl px-3 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Event</span>
            </button>
          </form>

          {/* Events List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.events.map((evt) => (
              <div
                key={evt.id}
                className="p-5 bg-slate-900/70 backdrop-blur-xl border border-cyan-500/20 rounded-2xl relative group hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                      {evt.date}
                    </span>
                    <h4 className="text-base font-bold text-cyan-100 mt-2">{evt.title}</h4>
                    <p className="text-xs text-cyan-300/80 font-mono flex items-center gap-1.5 mt-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {evt.time}
                    </p>
                    {evt.location && (
                      <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        {evt.location}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => deleteEvent(evt.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Reminders */}
      {activeTab === 'reminders' && (
        <div className="space-y-6">
          {/* Add Reminder Form */}
          <form
            onSubmit={handleAddReminder}
            className="p-4 bg-slate-900/80 border border-cyan-500/20 rounded-2xl flex flex-col md:flex-row items-center gap-3"
          >
            <input
              type="text"
              value={reminderTitle}
              onChange={(e) => setReminderTitle(e.target.value)}
              placeholder="What would you like Jarvis to remind you of?"
              required
              className="flex-1 bg-slate-950 text-cyan-100 border border-cyan-900/60 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-400 focus:outline-none"
            />

            <label className="flex items-center gap-2 text-xs font-mono text-cyan-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isLocationBased}
                onChange={(e) => setIsLocationBased(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
              Location-based
            </label>

            {isLocationBased ? (
              <input
                type="text"
                value={reminderLocation}
                onChange={(e) => setReminderLocation(e.target.value)}
                placeholder="Target Location (e.g. Bio Lab)"
                required={isLocationBased}
                className="w-48 bg-slate-950 text-cyan-100 border border-cyan-900/60 rounded-xl px-3 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
              />
            ) : (
              <input
                type="text"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                placeholder="Time (e.g. 05:00 PM)"
                className="w-36 bg-slate-950 text-cyan-100 border border-cyan-900/60 rounded-xl px-3 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
              />
            )}

            <button
              type="submit"
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Set Reminder</span>
            </button>
          </form>

          {/* Reminders List */}
          <div className="space-y-3">
            {state.reminders.map((rem) => (
              <div
                key={rem.id}
                className={`p-4 rounded-2xl border backdrop-blur-xl flex items-center justify-between gap-4 transition-all ${
                  rem.completed
                    ? 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                    : 'bg-slate-900/70 border-cyan-500/20 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={rem.completed}
                    onChange={() => toggleReminder(rem.id)}
                    className="w-5 h-5 rounded accent-cyan-400 cursor-pointer"
                  />

                  <div>
                    <p className={`text-sm font-medium ${rem.completed ? 'line-through text-slate-500' : 'text-cyan-100'}`}>
                      {rem.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {rem.locationBased ? (
                        <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/30 border border-amber-800/40">
                          <MapPin className="w-3 h-3" />
                          Triggers at: {rem.locationName || 'Specified Site'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/30 border border-cyan-800/40">
                          <Clock className="w-3 h-3" />
                          Triggers: {rem.time || 'Scheduled Time'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteReminder(rem.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
