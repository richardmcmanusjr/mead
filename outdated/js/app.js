export default function FuelingCoachPrototype() {
  const dayPlan = [
    { time: '2:00 PM', title: 'Pre-run fuel', detail: '75g carbs + 20g protein', note: 'Bagel + banana + Greek yogurt' },
    { time: '4:30 PM', title: 'Top-off', detail: '20g fast carbs', note: 'Chews or applesauce pouch' },
    { time: '5:00 PM', title: 'Hard run', detail: '6 x 800m intervals', note: 'Estimated burn: 720 kcal' },
    { time: '6:30 PM', title: 'Recovery', detail: '30g protein + 80g carbs', note: 'Rice bowl + chicken + fruit' },
  ];

  const cards = [
    { label: 'Readiness', value: 'Moderate', sub: 'Sleep was short' },
    { label: 'Goal', value: 'Run fast', sub: 'Maintain strength' },
    { label: 'Carbs left', value: '185g', sub: 'Based on today\'s target' },
    { label: 'Protein left', value: '82g', sub: 'Recovery still matters' },
  ];

  const workouts = [
    { day: 'Today', type: 'Intervals', time: '5:00 PM', duration: '60 min', intensity: 'High' },
    { day: 'Tomorrow', type: 'Easy run + lift', time: '7:00 AM', duration: '50 min', intensity: 'Low' },
    { day: 'Thu', type: 'Tempo', time: '6:00 PM', duration: '45 min', intensity: 'Medium' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 p-6">
      <div className="max-w-md mx-auto">
        <div className="rounded-[2rem] shadow-2xl border border-zinc-200 bg-white overflow-hidden">
          <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 text-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm/5 opacity-90">Fueling Coach</div>
                <h1 className="text-3xl font-semibold mt-1">Today’s plan</h1>
                <p className="text-sm mt-2 opacity-95">
                  Built around your 5:00 PM interval run and current recovery status.
                </p>
              </div>
              <div className="rounded-2xl bg-white/20 px-3 py-2 text-right backdrop-blur-sm">
                <div className="text-xs uppercase tracking-wide">Score</div>
                <div className="text-2xl font-bold">84</div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {cards.map((card) => (
                <div key={card.label} className="rounded-2xl bg-zinc-50 border border-zinc-200 p-3">
                  <div className="text-xs text-zinc-500">{card.label}</div>
                  <div className="text-xl font-semibold mt-1">{card.value}</div>
                  <div className="text-xs text-zinc-500 mt-1">{card.sub}</div>
                </div>
              ))}
            </div>

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
                <li>You have a high-intensity workout late in the day.</li>
                <li>Your recent intake suggests you still need more carbs before the session.</li>
                <li>Sleep was a little short, so recovery intake is emphasized tonight.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-zinc-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50">
                <div className="font-medium">Upcoming training</div>
                <div className="text-xs text-zinc-500">Pulled from your schedule</div>
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
          </div>

          <div className="border-t border-zinc-200 px-4 py-3 bg-white flex justify-around text-xs text-zinc-500">
            <div className="text-center">
              <div className="text-lg">🏠</div>
              <div>Home</div>
            </div>
            <div className="text-center">
              <div className="text-lg">🍚</div>
              <div>Plan</div>
            </div>
            <div className="text-center">
              <div className="text-lg">📅</div>
              <div>Schedule</div>
            </div>
            <div className="text-center">
              <div className="text-lg">👤</div>
              <div>You</div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white border border-zinc-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Prototype directions</h2>
          <p className="text-sm text-zinc-700 mt-2">
            This first screen is focused on the core product question: not “what did I eat,” but “what should I eat next?”
          </p>
          <div className="mt-3 space-y-2 text-sm text-zinc-700">
            <div>• Add manual workout time selection if Garmin only provides the day.</div>
            <div>• Later connect Garmin for workout type, MyFitnessPal for intake, and calendar for timing constraints.</div>
            <div>• The next screen to prototype should be a quick onboarding flow for goal, body weight, and workout time.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
