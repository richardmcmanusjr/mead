import React, { useState } from 'react';

export default function Profile({ userWeight, authenticated, onLogout }) {
  const [editMode, setEditMode] = useState(false);
  const [weight, setWeight] = useState(userWeight || 150);
  const [age, setAge] = useState(30);
  const [goal, setGoal] = useState('Performance');

  const handleSaveProfile = () => {
    setEditMode(false);
    // In a real app, you'd save this to state or backend
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <h3 className="font-semibold text-zinc-900">Your profile</h3>
        <p className="text-sm text-zinc-600 mt-1">
          Manage your settings and preferences
        </p>
      </div>

      {/* Account Status */}
      {authenticated && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-emerald-900">✓ Garmin Connected</div>
              <p className="text-sm text-emerald-700 mt-1">
                Your Garmin account is synced and providing real-time data
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="mt-3 w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
          >
            Disconnect Account
          </button>
        </div>
      )}

      {/* Personal Stats */}
      <div className="rounded-2xl border border-zinc-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Personal Stats</h4>
          <button
            onClick={() => setEditMode(!editMode)}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Body Weight (lbs)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Primary Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              >
                <option>Performance</option>
                <option>Endurance</option>
                <option>Weight Loss</option>
                <option>General Fitness</option>
              </select>
            </div>
            <button
              onClick={handleSaveProfile}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
              <span className="text-sm text-zinc-600">Body Weight</span>
              <span className="font-semibold">{weight} lbs</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
              <span className="text-sm text-zinc-600">Age</span>
              <span className="font-semibold">{age} years</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
              <span className="text-sm text-zinc-600">Goal</span>
              <span className="font-semibold">{goal}</span>
            </div>
          </div>
        )}
      </div>

      {/* Nutrition Preferences */}
      <div className="rounded-2xl border border-zinc-200 p-4">
        <h4 className="font-semibold mb-4">Nutrition Preferences</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg cursor-pointer hover:bg-zinc-100">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Prefer whole foods over gels/supplements</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg cursor-pointer hover:bg-zinc-100">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm">Avoid dairy</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg cursor-pointer hover:bg-zinc-100">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm">Avoid gluten</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg cursor-pointer hover:bg-zinc-100">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Vegetarian-friendly options</span>
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-zinc-200 p-4">
        <h4 className="font-semibold mb-4">Notifications</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg cursor-pointer hover:bg-zinc-100">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Pre-workout fuel reminders</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg cursor-pointer hover:bg-zinc-100">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Recovery meal suggestions</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg cursor-pointer hover:bg-zinc-100">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm">Weekly fueling tips</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg cursor-pointer hover:bg-zinc-100">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Schedule changes</span>
          </label>
        </div>
      </div>

      {/* About */}
      <div className="rounded-2xl border border-zinc-200 p-4 bg-zinc-50">
        <div className="text-sm">
          <div className="font-semibold mb-2">About Fueling Coach</div>
          <p className="text-zinc-600 text-xs mb-3">
            Version 1.0.0 — Built to optimize your nutrition timing around your actual workouts.
          </p>
          <div className="space-y-1 text-xs text-zinc-500">
            <div>• Data refreshes every time you open the app</div>
            <div>• Your data stays private and syncs with Garmin</div>
            <div>• Powered by sports nutrition science</div>
          </div>
        </div>
      </div>
    </div>
  );
}
