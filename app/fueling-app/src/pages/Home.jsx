import React from 'react';

export default function Home({
  todayWorkout,
  workouts,
  userWeight,
  cards,
  dayPlan,
  calculateFuelingScore
}) {
  return (
    <div className="space-y-4">
      {cards.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {cards.map((card) => (
            <div key={card.label} className="rounded-2xl bg-zinc-50 border border-zinc-200 p-3">
              <div className="text-xs text-zinc-500">{card.label}</div>
              <div className="text-xl font-semibold mt-1">{card.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{card.sub}</div>
            </div>
          ))}
        </div>
      )}

      {todayWorkout && (
        <>
          <div className="rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div>
                <div className="font-medium">Fuel timeline</div>
                <div className="text-xs text-zinc-500">What to eat next, and when</div>
              </div>
              <button className="text-sm font-medium rounded-full bg-zinc-900 text-white px-3 py-1.5">Remind me</button>
            </div>

            <div className="divide-y divide-zinc-200">
              {dayPlan.map((item) => (
                <div key={item.time + item.title} className="p-4 flex gap-3">
                  <div className="w-16 shrink-0">
                    <div className="text-sm font-semibold">{item.time}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-zinc-700 mt-0.5">{item.detail}</div>
                    <div className="text-xs text-zinc-500 mt-1">{item.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 p-4 bg-zinc-50">
            <div className="font-medium">Why this plan?</div>
            <ul className="mt-2 space-y-2 text-sm text-zinc-700 list-disc pl-5">
              <li>Your {todayWorkout.type} at {todayWorkout.time} requires strategic fueling.</li>
              <li>Pre-workout fuel will maximize performance and prevent bonking.</li>
              <li>Recovery intake prioritizes muscle repair and glycogen restoration.</li>
            </ul>
          </div>
        </>
      )}

      {workouts.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50">
            <div className="font-medium">Upcoming training</div>
            <div className="text-xs text-zinc-500">From your Garmin calendar</div>
          </div>
          <div className="divide-y divide-zinc-200">
            {workouts.map((w) => (
              <div key={w.day + w.type} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-zinc-500">{w.day}</div>
                  <div className="font-medium">{w.type}</div>
                  <div className="text-sm text-zinc-700">{w.time} · {w.duration}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${w.intensity === 'High' ? 'bg-red-100 text-red-700' : w.intensity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {w.intensity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
