import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import GarminConnect from 'garmin-connect';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const USERNAME = process.env.VITE_GARMIN_USERNAME;
const PASSWORD = process.env.VITE_GARMIN_PASSWORD;

// Create a single Garmin instance that persists across requests
let gc = null;
let isAuthenticated = false;
let lastRequestTime = 0;
const REQUEST_DELAY_MS = 2000; // 2 second delay between API calls
const CACHE_TTL_MS = 60 * 60 * 1000; // Cache for 1 hour
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000; // 5 second initial retry delay

// Cache for API responses
const responseCache = {
  'activities': { data: null, timestamp: 0 },
  'user-info': { data: null, timestamp: 0 },
  'sleep-data': { data: null, timestamp: 0 },
};

// Delay function to prevent rate limiting
async function delayRequest() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY_MS) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

// Get cached data if still valid
function getCachedData(key) {
  if (responseCache[key] && responseCache[key].data) {
    const age = Date.now() - responseCache[key].timestamp;
    if (age < CACHE_TTL_MS) {
      console.log(`Using cached data for ${key} (age: ${Math.round(age / 1000)}s)`);
      return responseCache[key].data;
    }
  }
  return null;
}

// Set cached data
function setCachedData(key, data) {
  responseCache[key] = {
    data: data,
    timestamp: Date.now()
  };
}

// Retry wrapper with exponential backoff
async function withRetry(fn, maxRetries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries && error.message && error.message.includes('429')) {
        const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`Rate limited (attempt ${attempt}/${maxRetries}). Retrying in ${Math.round(delayMs / 1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else if (attempt < maxRetries) {
        console.log(`Attempt ${attempt}/${maxRetries} failed. Retrying...`);
        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS));
      }
    }
  }
  throw lastError;
}

async function initGarmin() {
  if (gc && isAuthenticated) {
    return gc;
  }

  if (!USERNAME || !PASSWORD) {
    throw new Error('Missing VITE_GARMIN_USERNAME or VITE_GARMIN_PASSWORD in environment');
  }

  gc = new GarminConnect.GarminConnect({
    username: USERNAME,
    password: PASSWORD,
  });
  try {
    console.log('Authenticating with Garmin...');
    await delayRequest();
    await gc.login();
    isAuthenticated = true;
    console.log('Successfully authenticated with Garmin');
    return gc;
  } catch (error) {
    console.error('Garmin authentication failed:', error.message);
    isAuthenticated = false;
    gc = null; // Reset instance on auth failure
    throw error;
  }
}

// Proxy endpoint for user info
app.get('/api/user-info', async (req, res) => {
  try {
    console.log('Fetching user profile...');
    
    // Check cache first
    const cached = getCachedData('user-info');
    if (cached) {
      return res.json(cached);
    }
    
    await delayRequest();
    const garmin = await initGarmin();
    
    const userProfile = await withRetry(async () => {
      return await garmin.getUserProfile();
    });
    
    const result = {
      weight: userProfile.weight || 150,
      displayName: userProfile.displayName,
      gender: userProfile.gender,
    };
    
    setCachedData('user-info', result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    
    // Return cached data even if expired as fallback
    const staleCache = responseCache['user-info'].data;
    if (staleCache) {
      console.log('Returning stale cached user info due to error');
      return res.json(staleCache);
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for today's activities
app.get('/api/today-activities', async (req, res) => {
  try {
    console.log('Fetching today activities...');
    
    // Check cache first
    const cached = getCachedData('activities');
    if (cached) {
      return res.json(cached);
    }
    
    await delayRequest();
    const garmin = await initGarmin();
    
    const allActivities = await withRetry(async () => {
      return await garmin.getActivities(0, 50);
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayActivities = (allActivities || []).filter(activity => {
      const activityDate = new Date(activity.startTimeInSeconds ? activity.startTimeInSeconds * 1000 : activity.startTimeMillis);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === today.getTime();
    });

    console.log(`Found ${todayActivities.length} activities for today`);
    setCachedData('activities', todayActivities);
    res.json(todayActivities || []);
  } catch (error) {
    console.error('Error fetching today activities:', error.message);
    
    // Return cached data even if expired as fallback
    const staleCache = responseCache['activities'].data;
    if (staleCache) {
      console.log('Returning stale cached activities due to error');
      return res.json(staleCache);
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for upcoming activities (next 7 days)
app.get('/api/upcoming-activities', async (req, res) => {
  try {
    console.log('Fetching upcoming activities...');
    
    // Check cache first
    const cached = getCachedData('activities');
    if (cached) {
      return res.json(cached);
    }
    
    await delayRequest();
    const garmin = await initGarmin();
    
    const allActivities = await withRetry(async () => {
      return await garmin.getActivities(0, 100);
    });
    
    const now = new Date();
    const futureActivities = (allActivities || []).filter(activity => {
      const activityDate = new Date(activity.startTimeInSeconds ? activity.startTimeInSeconds * 1000 : activity.startTimeMillis);
      return activityDate > now;
    });

    console.log(`Found ${futureActivities.length} future activities`);
    setCachedData('activities', futureActivities);
    res.json(futureActivities || []);
  } catch (error) {
    console.error('Error fetching upcoming activities:', error.message);
    
    // Return cached data even if expired as fallback
    const staleCache = responseCache['activities'].data;
    if (staleCache) {
      console.log('Returning stale cached activities due to error');
      return res.json(staleCache);
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for sleep data
app.get('/api/sleep-data', async (req, res) => {
  try {
    console.log('Fetching sleep data...');
    
    // Check cache first
    const cached = getCachedData('sleep-data');
    if (cached) {
      return res.json(cached);
    }
    
    await delayRequest();
    const garmin = await initGarmin();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    try {
      const sleepData = await withRetry(async () => {
        return await garmin.getSleepData(yesterday);
      });
      
      if (sleepData && sleepData.dailySleepDTO) {
        const data = sleepData.dailySleepDTO;
        let overallScore = 0;
        if (data.sleepScores && data.sleepScores.overall) {
          overallScore = data.sleepScores.overall.value || 0;
        }
        
        const result = {
          sleepScore: overallScore,
          duration: data.sleepTimeSeconds || 0,
          startTime: data.sleepStartTimestampGMT || 0,
          sleepData: data
        };
        
        console.log('Sleep score extracted:', overallScore);
        setCachedData('sleep-data', result);
        return res.json(result);
      } else {
        const result = {
          sleepScore: 0,
          duration: 0,
          startTime: 0,
          sleepData: null
        };
        setCachedData('sleep-data', result);
        return res.json(result);
      }
    } catch (e) {
      console.log('getSleepData failed, using getSleepDuration:', e.message);
      const sleepDuration = await withRetry(async () => {
        return await garmin.getSleepDuration(yesterday);
      });
      
      const result = {
        sleepScore: 0,
        duration: (parseInt(sleepDuration.hours) * 60 + parseInt(sleepDuration.minutes)) * 60,
        startTime: 0,
        sleepData: sleepDuration
      };
      
      setCachedData('sleep-data', result);
      return res.json(result);
    }
  } catch (error) {
    console.error('Error fetching sleep data:', error.message);
    
    // Return cached data even if expired as fallback
    const staleCache = responseCache['sleep-data'].data;
    if (staleCache) {
      console.log('Returning stale cached sleep data due to error');
      return res.json(staleCache);
    }
    
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Garmin proxy server running on http://localhost:${PORT}`);
  // Pre-authenticate on startup
  initGarmin().catch(err => console.error('Failed to initialize Garmin on startup:', err.message));
});
