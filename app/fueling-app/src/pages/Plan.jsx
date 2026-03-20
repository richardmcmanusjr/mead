import React, { useState } from 'react';

export default function Plan({ todayWorkout, userWeight, dayPlan }) {
  const [selectedMeal, setSelectedMeal] = useState(null);

  const mealDetails = {
    'Pre-workout fuel': {
      description: 'Eat 90 minutes before your workout',
      rationale: 'Allows time for digestion while providing energy',
      alternatives: ['Oatmeal + honey + almonds', 'Toast + peanut butter + banana', 'Energy bar + fruit'],
    },
    'Top-off': {
      description: 'Quick carbs 30 minutes before',
      rationale: 'Tops off glycogen and prevents energy dips',
      alternatives: ['Energy gels', 'Sports drink', 'Dates or dried fruit'],
    },
    'Recovery meal': {
      description: 'Eat within 60-90 minutes after workout',
      rationale: 'Maximizes muscle protein synthesis and glycogen restoration',
      alternatives: ['Chicken sandwich + fruit', 'Protein smoothie + granola', 'Pasta + lean protein'],
    },
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
        <h3 className="font-semibold text-zinc-900">Today's fueling plan</h3>
        <p className="text-sm text-zinc-600 mt-1">
          Optimized for your {todayWorkout?.type} workout at {todayWorkout?.time}
        </p>
      </div>

      <div className="space-y-2">
        {dayPlan.map((item, idx) => {
          const isMeal = item.title !== `${todayWorkout?.type} workout`;
          return (
            <button
              key={item.time + item.title}
              onClick={() => setSelectedMeal(isMeal ? item.title : null)}
              className={`w-full text-left rounded-2xl border p-4 transition ${
                selectedMeal === item.title
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm text-zinc-500">{item.time}</div>
                  <div className="font-medium mt-1">{item.title}</div>
                  <div className="text-sm text-zinc-700 mt-1">{item.detail}</div>
                </div>
                <div className={`text-lg transition ${selectedMeal === item.title ? 'rotate-90' : ''}`}>
                  ▶
                </div>
              </div>

              {selectedMeal === item.title && mealDetails[item.title] && (
                <div className="mt-4 pt-4 border-t border-orange-200 space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-zinc-600 uppercase">Why this?</div>
                    <p className="text-sm text-zinc-700 mt-1">{mealDetails[item.title].rationale}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-600 uppercase">Alternatives</div>
                    <ul className="text-sm text-zinc-700 mt-1 space-y-1">
                      {mealDetails[item.title].alternatives.map((alt) => (
                        <li key={alt} className="flex items-center gap-2">
                          <span className="text-zinc-400">•</span> {alt}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-600 uppercase">Note</div>
                    <p className="text-sm text-zinc-700 mt-1">{item.note}</p>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-zinc-200 p-4 bg-zinc-50">
        <div className="font-semibold mb-3">Quick tips</div>
        <ul className="space-y-2 text-sm text-zinc-700">
          <li>✓ Prioritize familiar foods on race/test day</li>
          <li>✓ Hydrate consistently throughout the day</li>
          <li>✓ Avoid high-fiber foods within 2 hours of workout</li>
          <li>✓ Save big meals for at least 3 hours before intense exercise</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-zinc-200 p-4 bg-blue-50">
        <div className="font-semibold text-blue-900 mb-2">💡 Personalization</div>
        <p className="text-sm text-blue-800">
          This plan is based on your workout duration and intensity. Adjust portion sizes based on your body weight, fitness level, and past experiences.
        </p>
      </div>
    </div>
  );
}
