import React, { useState } from 'react';

export default function Schedule({ workouts }) {
  const [expandedDay, setExpandedDay] = useState(null);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const todayDay = today.getDay();

  // Generate a mock week schedule
  const weekSchedule = weekDays.map((day, idx) => {
    const offset = idx - (todayDay === 0 ? 6 : todayDay - 1);
    const date = new Date(today);
    date.setDate(date.getDate() + offset);

    // Add some sample workouts
    const dayWorkouts = [];
    if (idx === (todayDay === 0 ? 6 : todayDay - 1)) {
      dayWorkouts.push(...(workouts || []));
    } else if (idx % 2 === 0) {
      dayWorkouts.push({
        type: idx % 3 === 0 ? 'Strength' : 'Easy run',
        time: '7:00 AM',
        duration: '45 min',
        intensity: 'Low',
      });
    } else if (idx % 3 === 1) {
      dayWorkouts.push({
        type: 'Tempo run',
        time: '6:00 PM',
        duration: '40 min',
        intensity: 'Medium',
      });
    }

    return {
      day,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      workouts: dayWorkouts,
      isToday: offset === 0,
    };
  });

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <h3 className="font-semibold text-zinc-900">Your training week</h3>
        <p className="text-sm text-zinc-600 mt-1">
          Plan your nutrition around your schedule
        </p>
      </div>

      <div className="space-y-2">
        {weekSchedule.map((dayData) => (
          <div
            key={dayData.day}
            className={`rounded-2xl border transition ${
              dayData.isToday
                ? 'border-orange-500 bg-orange-50'
                : 'border-zinc-200 bg-white'
            }`}
          >
            <button
              onClick={() =>
                setExpandedDay(expandedDay === dayData.day ? null : dayData.day)
              }
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{dayData.day}</div>
                  <div className="text-sm text-zinc-500">{dayData.date}</div>
                  {dayData.isToday && (
                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                      Today
                    </span>
                  )}
                </div>
                {dayData.workouts.length > 0 && (
                  <div className="text-sm text-zinc-600 mt-1">
                    {dayData.workouts.length} workout{dayData.workouts.length !== 1 ? 's' : ''}
                  </div>
                )}
                {dayData.workouts.length === 0 && (
                  <div className="text-sm text-zinc-500 mt-1">Rest day</div>
                )}
              </div>
              <div
                className={`text-lg transition ${
                  expandedDay === dayData.day ? 'rotate-90' : ''
                }`}
              >
                {dayData.workouts.length > 0 ? '▶' : '—'}
              </div>
            </button>

            {expandedDay === dayData.day && dayData.workouts.length > 0 && (
              <div className="border-t border-zinc-200 divide-y divide-zinc-200 bg-zinc-50">
                {dayData.workouts.map((workout, idx) => (
                  <div key={idx} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{workout.type}</div>
                        <div className="text-sm text-zinc-600 mt-1">
                          {workout.time} · {workout.duration}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          workout.intensity === 'High'
                            ? 'bg-red-100 text-red-700'
                            : workout.intensity === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {workout.intensity}
                      </span>
                    </div>
                    <div className="mt-3 text-xs bg-white rounded-lg p-2 text-zinc-600">
                      💡 {
                        workout.intensity === 'High'
                          ? 'Plan robust fueling - this is a demanding session'
                          : workout.intensity === 'Medium'
                          ? 'Moderate fueling strategy recommended'
                          : 'Light fueling - prioritize hydration'
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 p-4 bg-purple-50">
        <div className="font-semibold text-purple-900 mb-2">📋 Planning tips</div>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Cluster hard workouts with adequate recovery</li>
          <li>• Plan nutrition differently for different intensity levels</li>
          <li>• Rest days are important for recovery and adaptation</li>
          <li>• Consider your schedule when planning big training weeks</li>
        </ul>
      </div>
    </div>
  );
}
