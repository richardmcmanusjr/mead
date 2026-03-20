import { useEffect, useState } from 'react';
import { getTodayActivities, getUpcomingActivities, getUserInfo, getSleepData } from './services/garminData';
import { isAuthenticated, getStoredCredentials, directLogin, logout } from './services/garminAuth';
import Home from './pages/Home';
import Plan from './pages/Plan';
import Schedule from './pages/Schedule';
import Profile from './pages/Profile';

export default function FuelingCoachPrototype() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [userWeight, setUserWeight] = useState(null);
  const [dayPlan, setDayPlan] = useState([]);
  const [cards, setCards] = useState([]);
  const [sleepData, setSleepData] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Fetch Garmin data on mount
  useEffect(() => {
    if (authenticated) {
      loadGarminData();
    } else {
      setLoading(false);
    }
  }, [authenticated]);

  async function loadGarminData() {
    try {
      setLoading(true);
      setError(null);

      // Add a timeout for API calls
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Garmin API request timed out')), 10000)
      );

      // Fetch user info
      try {
        const userInfo = await Promise.race([getUserInfo(), timeoutPromise]);
        setUserWeight(userInfo.weight);
      } catch (err) {
        console.warn('Could not fetch user info:', err);
        setUserWeight(150); // Default weight
      }

      // Fetch sleep data
      let sleepInfo = null;
      try {
        const sleep = await Promise.race([getSleepData(), timeoutPromise]);
        setSleepData(sleep);
        sleepInfo = sleep;
        console.log('Sleep data set:', sleep);
      } catch (err) {
        console.warn('Could not fetch sleep data:', err);
      }

      // Fetch today's activities
      let todayInfo = null;
      try {
        const todayActivities = await Promise.race([getTodayActivities(), timeoutPromise]);
        if (todayActivities && todayActivities.length > 0) {
          const primaryWorkout = todayActivities[0];
          setTodayWorkout(primaryWorkout);
          todayInfo = primaryWorkout;
          generateDayPlan(primaryWorkout, 150);
        } else {
          loadDemoData();
        }
      } catch (err) {
        console.warn('Could not fetch today activities:', err);
        loadDemoData();
      }

      // Fetch upcoming activities
      try {
        const upcomingActivities = await Promise.race([getUpcomingActivities(3), timeoutPromise]);
        if (upcomingActivities && upcomingActivities.length > 0) {
          setWorkouts(upcomingActivities.slice(0, 3));
        }
      } catch (err) {
        console.warn('Could not fetch upcoming activities:', err);
      }

      // Generate cards with real sleep data
      generateCards(todayInfo, 150, sleepInfo);
    } catch (err) {
      console.error('Error loading Garmin data:', err);
      setError('Connected but having trouble loading your data. Showing demo.');
      loadDemoData();
    } finally {
      setLoading(false);
    }
  }

  function generateDayPlan(workout, weight) {
    if (!workout) return;

    const caloriesBurned = workout.calories || calculateEstimatedCalories(workout, weight);
    const carbsNeeded = Math.round((caloriesBurned * 0.6) / 4); // 60% carbs
    const proteinNeeded = Math.round(weight * 1.2); // ~1.2g per lb for recovery

    const workoutTime = new Date(workout.startTime);
    const preWorkoutTime = new Date(workoutTime.getTime() - 90 * 60000);
    const topOffTime = new Date(workoutTime.getTime() - 30 * 60000);
    const recoveryTime = new Date(workoutTime.getTime() + 90 * 60000);

    setDayPlan([
      {
        time: preWorkoutTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        title: 'Pre-workout fuel',
        detail: `${Math.round(carbsNeeded * 0.4)}g carbs + 20g protein`,
        note: 'Bagel + banana + Greek yogurt',
      },
      {
        time: topOffTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        title: 'Top-off',
        detail: '20g fast carbs',
        note: 'Chews or applesauce pouch',
      },
      {
        time: workoutTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        title: `${workout.type} workout`,
        detail: `${workout.duration}`,
        note: `Estimated burn: ${Math.round(caloriesBurned)} kcal`,
      },
      {
        time: recoveryTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        title: 'Recovery meal',
        detail: `${proteinNeeded}g protein + ${carbsNeeded}g carbs`,
        note: 'Rice bowl + chicken + fruit',
      },
    ]);
  }

  function generateCards(todayWorkout, weight, sleepInfo) {
    const intensity = todayWorkout?.intensity || 'Low';
    const score = calculateFuelingScore(todayWorkout, weight);
    const sleepToUse = sleepInfo || sleepData;

    const cardsData = [
      { label: 'Sleep Score', value: sleepToUse ? sleepToUse.sleepScore : '—', sub: sleepToUse ? `${Math.floor(sleepToUse.duration / 3600)}hr ${Math.floor((sleepToUse.duration % 3600) / 60)}m` : 'Last night' },
      { label: 'Readiness', value: 'Moderate', sub: sleepToUse && sleepToUse.sleepScore < 60 ? 'Consider recovery day' : 'Ready to go' },
      { label: 'Goal', value: 'Perform well', sub: intensity + ' intensity planned' },
      { label: 'Carbs needed', value: Math.round((todayWorkout?.calories || 600) * 0.6 / 4) + 'g', sub: 'For today\'s workout' },
    ];

    setCards(cardsData);
  }

  function calculateEstimatedCalories(workout, weight) {
    // Rough estimation based on activity type and duration
    const durationMinutes = parseInt(workout.duration);
    const caloriesPerMinute = {
      'Run': 12,
      'Bike': 10,
      'Swim': 11,
      'Strength': 6,
      'Rowing': 14,
    };
    const rate = caloriesPerMinute[workout.type] || 8;
    return Math.round(rate * durationMinutes * (weight / 150)); // Adjust for body weight
  }

  function calculateFuelingScore(workout, weight) {
    if (!workout) return 50;
    let score = 50;
    if (workout.intensity === 'High') score += 20;
    if (workout.intensity === 'Medium') score += 10;
    if (workout.calories > 500) score += 10;
    return Math.min(score, 100);
  }

  function loadDemoData() {
    // Fallback demo data
    setDayPlan([
      { time: '2:00 PM', title: 'Pre-run fuel', detail: '75g carbs + 20g protein', note: 'Bagel + banana + Greek yogurt' },
      { time: '4:30 PM', title: 'Top-off', detail: '20g fast carbs', note: 'Chews or applesauce pouch' },
      { time: '5:00 PM', title: 'Hard run', detail: '6 x 800m intervals', note: 'Estimated burn: 720 kcal' },
      { time: '6:30 PM', title: 'Recovery', detail: '30g protein + 80g carbs', note: 'Rice bowl + chicken + fruit' },
    ]);

    setCards([
      { label: 'Readiness', value: 'Moderate', sub: 'Sleep was short' },
      { label: 'Goal', value: 'Run fast', sub: 'Maintain strength' },
      { label: 'Carbs left', value: '185g', sub: 'Based on today\'s target' },
      { label: 'Protein left', value: '82g', sub: 'Recovery still matters' },
    ]);

    setWorkouts([
      { day: 'Today', type: 'Intervals', time: '5:00 PM', duration: '60 min', intensity: 'High' },
      { day: 'Tomorrow', type: 'Easy run + lift', time: '7:00 AM', duration: '50 min', intensity: 'Low' },
      { day: 'Thu', type: 'Tempo', time: '6:00 PM', duration: '45 min', intensity: 'Medium' },
    ]);
  }

  async function handleLogin(e) {
    e?.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setIsLoggingIn(true);
      setError(null);
      
      await directLogin(username, password);
      setAuthenticated(true);
      setUsername('');
      setPassword('');
    } catch (err) {
      console.error('Error starting Garmin login:', err);
      setError(`Login failed: ${err.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleLogout() {
    logout();
    setAuthenticated(false);
    setTodayWorkout(null);
    setWorkouts([]);
    loadDemoData();
  }

  // Show login form while not authenticated
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 p-6">
        <div className="max-w-md mx-auto">
          <div className="rounded-[2rem] shadow-2xl border border-zinc-200 bg-white overflow-hidden">
            <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 text-white p-6">
              <h1 className="text-3xl font-semibold">Fueling Coach</h1>
              <p className="text-sm mt-3">Connect your Garmin account to get personalized fueling recommendations based on your actual workouts.</p>
            </div>
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Garmin Email
                </label>
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  disabled={isLoggingIn}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  disabled={isLoggingIn}
                />
              </div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
              >
                {isLoggingIn ? 'Logging in...' : 'Connect Garmin Account'}
              </button>
            </form>
            <div className="px-6 pb-6 border-t border-zinc-200 text-sm text-zinc-600">
              <p className="font-semibold mb-3">How it works:</p>
              <ul className="space-y-2 list-disc pl-5">
                <li>We securely connect to your Garmin account</li>
                <li>We analyze your upcoming workouts</li>
                <li>We generate personalized fueling plans</li>
                <li>All data stays private and on your device</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-zinc-600">Loading your Garmin data...</p>
        </div>
      </div>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Home
            todayWorkout={todayWorkout}
            workouts={workouts}
            userWeight={userWeight}
            cards={cards}
            dayPlan={dayPlan}
            calculateFuelingScore={calculateFuelingScore}
          />
        );
      case 'plan':
        return (
          <Plan
            todayWorkout={todayWorkout}
            userWeight={userWeight}
            dayPlan={dayPlan}
          />
        );
      case 'schedule':
        return <Schedule workouts={workouts} />;
      case 'profile':
        return (
          <Profile
            userWeight={userWeight}
            authenticated={authenticated}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  // Get header content based on tab
  const getHeaderContent = () => {
    const titles = {
      home: "Today's plan",
      plan: 'Fueling Plan',
      schedule: 'Schedule',
      profile: 'Profile',
    };

    const subtitles = {
      home: todayWorkout 
        ? `Built around your ${todayWorkout.time} ${todayWorkout.type} (${todayWorkout.duration}).`
        : "Connect your Garmin account to start.",
      plan: "Detailed fueling recommendations",
      schedule: "Plan your week",
      profile: "Manage your settings",
    };

    return {
      title: titles[activeTab],
      subtitle: subtitles[activeTab],
    };
  };

  const headerContent = getHeaderContent();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 p-6">
      <div className="max-w-md mx-auto">
        <div className="rounded-[2rem] shadow-2xl border border-zinc-200 bg-white overflow-hidden flex flex-col h-screen max-h-screen">
          {/* Header */}
          <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 text-white p-6 shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm/5 opacity-90">Fueling Coach</div>
                <h1 className="text-3xl font-semibold mt-1">
                  {headerContent.title}
                </h1>
                <p className="text-sm mt-2 opacity-95">
                  {headerContent.subtitle}
                </p>
              </div>
              {activeTab === 'home' && (
                <div className="rounded-2xl bg-white/20 px-3 py-2 text-right backdrop-blur-sm">
                  <div className="text-xs uppercase tracking-wide">Score</div>
                  <div className="text-2xl font-bold">
                    {todayWorkout ? calculateFuelingScore(todayWorkout, userWeight) : '—'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {authenticated && activeTab === 'home' && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-emerald-900">✓ Garmin Connected</div>
                  <button
                    onClick={handleLogout}
                    className="text-xs px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}

            {renderTabContent()}
          </div>

          {/* Tab Navigation */}
          <div className="border-t border-zinc-200 px-4 py-3 bg-white shrink-0 flex justify-around">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
                activeTab === 'home'
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <div className="text-lg">🏠</div>
              <div className="text-xs font-medium">Home</div>
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
                activeTab === 'plan'
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <div className="text-lg">🍚</div>
              <div className="text-xs font-medium">Plan</div>
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
                activeTab === 'schedule'
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <div className="text-lg">📅</div>
              <div className="text-xs font-medium">Schedule</div>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
                activeTab === 'profile'
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <div className="text-lg">👤</div>
              <div className="text-xs font-medium">You</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
