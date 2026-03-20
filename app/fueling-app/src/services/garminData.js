// Garmin Connect Data Fetching Service - Using Backend Proxy
// Fetches workout and activity data through a backend server to avoid CORS issues

import { getStoredCredentials } from './garminAuth';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://mead-backend.onrender.com/api'
  : 'http://localhost:3001/api';

// Helper function to get credentials and build query params
function getCredentialsParams() {
  const { username, password } = getStoredCredentials();
  return new URLSearchParams({ username, password });
}

// Fetch recent activities/workouts
export async function getRecentActivities(limit = 10) {
  try {
    console.log('Fetching recent activities from backend...');
    const params = getCredentialsParams();
    const response = await fetch(
      `${API_BASE}/upcoming-activities?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch activities: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Recent activities data:', data);
    return formatActivitiesForApp(data);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}

// Fetch today's activities
export async function getTodayActivities() {
  try {
    console.log('Fetching today activities from backend...');
    
    const params = getCredentialsParams();
    const response = await fetch(
      `${API_BASE}/today-activities?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch today's activities: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Today activities response:', data);
    
    return formatActivitiesForApp(data);
  } catch (error) {
    console.error('Error fetching today activities:', error);
    return [];
  }
}

// Fetch upcoming events (scheduled workouts)
export async function getUpcomingActivities(days = 7) {
  try {
    console.log('Fetching upcoming activities from backend...');
    
    const params = getCredentialsParams();
    const response = await fetch(
      `${API_BASE}/upcoming-activities?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch upcoming activities: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Upcoming activities response:', data);
    
    const formatted = formatActivitiesForApp(data);
    
    // Filter for future activities
    const now = new Date();
    const futureActivities = formatted.filter(activity => {
      const activityDate = new Date(activity.startTime);
      return activityDate > now;
    }).slice(0, days);
    
    console.log('Filtered upcoming activities:', futureActivities);
    return futureActivities;
  } catch (error) {
    console.error('Error fetching upcoming activities:', error);
    return [];
  }
}

// Get user info (weight, etc.)
export async function getUserInfo() {
  try {
    console.log('Fetching user info from backend...');
    
    const params = getCredentialsParams();
    const response = await fetch(
      `${API_BASE}/user-info?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('User info:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return {
      weight: 150,
      birthdate: null,
      gender: null,
      firstName: 'Athlete',
      lastName: '',
    };
  }
}

// Get sleep data from last night
export async function getSleepData() {
  try {
    console.log('Fetching sleep data from backend...');
    
    const params = getCredentialsParams();
    const response = await fetch(
      `${API_BASE}/sleep-data?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch sleep data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Sleep data:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching sleep data:', error);
    return null;
  }
}

// Format Garmin activities to app format
function formatActivitiesForApp(garminActivities) {
  if (!garminActivities || !Array.isArray(garminActivities)) {
    return [];
  }

  return garminActivities.map((activity) => {
    const startTime = new Date(activity.startTimeInSeconds ? activity.startTimeInSeconds * 1000 : activity.startTimeMillis);
    const durationMinutes = Math.round((activity.durationInSeconds || activity.duration) / 60);
    const intensity = getIntensityLevel(activity);

    return {
      id: activity.activityId,
      day: getDateLabel(startTime),
      type: mapActivityType(activity.activityType?.typeKey || activity.activityType),
      time: startTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      duration: `${durationMinutes} min`,
      intensity: intensity,
      calories: activity.calories || 0,
      distance: activity.distance ? `${(activity.distance / 1000).toFixed(1)} km` : null,
      avgHR: activity.avgHeartRate || null,
      startTime: startTime.toISOString(),
    };
  });
}

// Get relative date label (Today, Tomorrow, Thu, etc.)
function getDateLabel(date) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isSameDay = (d1, d2) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, tomorrow)) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// Map Garmin activity types to app types
function mapActivityType(typeKey) {
  const typeMap = {
    'running': 'Run',
    'cycling': 'Bike',
    'swimming': 'Swim',
    'strength_training': 'Strength',
    'elliptical': 'Elliptical',
    'rowing': 'Rowing',
    'tennis': 'Tennis',
    'basketball': 'Basketball',
    'soccer': 'Soccer',
    'football': 'Football',
    'hiking': 'Hike',
    'trail_running': 'Trail Run',
    'walking': 'Walk',
  };

  const key = typeKey?.toLowerCase?.() || '';
  return typeMap[key] || 'Workout';
}

// Determine intensity based on HR zones or pace
function getIntensityLevel(activity) {
  // If we have avg HR and max HR, use that to determine intensity
  if (activity.avgHeartRate && activity.maxHeartRate) {
    const hrRatio = activity.avgHeartRate / activity.maxHeartRate;
    if (hrRatio > 0.85) return 'High';
    if (hrRatio > 0.70) return 'Medium';
    return 'Low';
  }

  // Fall back to activity type defaults
  const type = activity.activityType?.typeKey?.toLowerCase?.();
  if (type?.includes('interval') || type?.includes('tempo')) return 'High';
  if (type?.includes('easy') || type?.includes('recovery')) return 'Low';
  
  return 'Medium';
}
