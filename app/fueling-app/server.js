import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import GarminConnect from 'garmin-connect';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Dynamic Garmin instances per user
const garminInstances = {};
const requestQueues = {}; // Per-user request queues
let lastRequestTime = 0;
const REQUEST_DELAY_MS = 3000; // 3 second delay between API calls
const CACHE_TTL_MS = 60 * 60 * 1000; // Cache for 1 hour
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 10000; // 10 second initial retry delay for 429 errors

// Cache for API responses
const responseCache = {
  'activities': { data: null, timestamp: 0 },
  'user-info': { data: null, timestamp: 0 },
  'sleep-data': { data: null, timestamp: 0 },
};

// Request queue to serialize requests per user
class RequestQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const { fn, resolve, reject } = this.queue.shift();
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      // Add delay between queued requests
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS));
      }
    }
    this.isProcessing = false;
  }
}

// Delay function to prevent rate limiting
async function delayRequest() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY_MS) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

// Get or create request queue for user
function getRequestQueue(username) {
  if (!requestQueues[username]) {
    requestQueues[username] = new RequestQueue();
  }
  return requestQueues[username];
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

// Enhanced retry wrapper with aggressive exponential backoff for rate limiting
async function withRetry(fn, maxRetries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorMsg = error.message || '';
      const is429 = errorMsg.includes('429') || errorMsg.includes('Too Many Requests') || errorMsg.includes('rate limited');
      
      if (attempt < maxRetries) {
        let delayMs;
        if (is429) {
          // Aggressive backoff for rate limiting: 10s, 20s, 40s, 80s, 160s
          delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          console.warn(`⚠️ Rate limited (429) on attempt ${attempt}/${maxRetries}. Waiting ${Math.round(delayMs / 1000)}s before retry...`);
        } else {
          // Standard backoff for other errors: 5s, 10s, 15s, 20s, 25s
          delayMs = REQUEST_DELAY_MS * attempt;
          console.log(`⚠️ Attempt ${attempt}/${maxRetries} failed (${errorMsg}). Retrying in ${Math.round(delayMs / 1000)}s...`);
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        console.error(`❌ All ${maxRetries} attempts failed. Last error: ${errorMsg}`);
      }
    }
  }
  throw lastError;
}

async function initGarmin(username, password) {
  if (!username || !password) {
    throw new Error('Missing username or password');
  }

  // Create a unique key for this user's credentials
  const userKey = `${username}`;
  
  // Reuse existing instance if available
  if (garminInstances[userKey]) {
    console.log(`✓ Using cached Garmin instance for ${username}`);
    return garminInstances[userKey];
  }

  const gc = new GarminConnect.GarminConnect({
    username: username,
    password: password,
  });
  
  try {
    console.log(`🔐 Authenticating with Garmin for ${username}...`);
    await delayRequest();
    await gc.login();
    console.log(`✅ Successfully authenticated with Garmin for ${username}`);
    
    // Cache the instance
    garminInstances[userKey] = gc;
    
    // Clear cache after 1 hour to force re-auth
    setTimeout(() => {
      delete garminInstances[userKey];
      console.log(`🧹 Cleared Garmin instance for ${username}`);
    }, CACHE_TTL_MS);
    
    return gc;
  } catch (error) {
    console.error(`❌ Garmin authentication failed for ${username}:`, error.message);
    throw error;
  }
}

// Proxy endpoint for user info
app.get('/api/user-info', async (req, res) => {
  try {
    const { username, password } = req.query;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    console.log('📊 Fetching user profile...');
    
    // Check cache first
    const cached = getCachedData('user-info');
    if (cached) {
      console.log('✓ Returning cached user info');
      return res.json(cached);
    }
    
    // Use per-user request queue to serialize requests
    const queue = getRequestQueue(username);
    const result = await queue.add(async () => {
      await delayRequest();
      const garmin = await initGarmin(username, password);
      
      const userProfile = await withRetry(async () => {
        return await garmin.getUserProfile();
      });
      
      const data = {
        weight: userProfile.weight || 150,
        displayName: userProfile.displayName,
        gender: userProfile.gender,
      };
      
      setCachedData('user-info', data);
      return data;
    });
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error fetching user profile:', error.message);
    
    // Return cached data even if expired as fallback
    const staleCache = responseCache['user-info'].data;
    if (staleCache) {
      console.log('⚠️ Returning stale cached user info due to error');
      return res.json(staleCache);
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for today's activities
app.get('/api/today-activities', async (req, res) => {
  try {
    const { username, password } = req.query;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }
    
    console.log('📅 Fetching today activities...');
    
    // Check cache first
    const cached = getCachedData('activities');
    if (cached) {
      console.log('✓ Returning cached today activities');
      return res.json(cached);
    }
    
    // Use per-user request queue to serialize requests
    const queue = getRequestQueue(username);
    const result = await queue.add(async () => {
      await delayRequest();
      const garmin = await initGarmin(username, password);
      
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

      console.log(`✓ Found ${todayActivities.length} activities for today`);
      setCachedData('activities', todayActivities);
      return todayActivities;
    });
    
    res.json(result || []);
  } catch (error) {
    console.error('❌ Error fetching today activities:', error.message);
    
    // Return cached data even if expired as fallback
    const staleCache = responseCache['activities'].data;
    if (staleCache) {
      console.log('⚠️ Returning stale cached activities due to error');
      return res.json(staleCache);
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for upcoming activities (next 7 days)
app.get('/api/upcoming-activities', async (req, res) => {
  try {
    const { username, password } = req.query;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }
    
    console.log('📆 Fetching upcoming activities...');
    
    // Check cache first
    const cached = getCachedData('activities');
    if (cached) {
      console.log('✓ Returning cached upcoming activities');
      return res.json(cached);
    }
    
    // Use per-user request queue to serialize requests
    const queue = getRequestQueue(username);
    const result = await queue.add(async () => {
      await delayRequest();
      const garmin = await initGarmin(username, password);
      
      const allActivities = await withRetry(async () => {
        return await garmin.getActivities(0, 100);
      });
      
      const now = new Date();
      const futureActivities = (allActivities || []).filter(activity => {
        const activityDate = new Date(activity.startTimeInSeconds ? activity.startTimeInSeconds * 1000 : activity.startTimeMillis);
        return activityDate > now;
      });

      console.log(`✓ Found ${futureActivities.length} future activities`);
      setCachedData('activities', futureActivities);
      return futureActivities;
    });

    res.json(result || []);
  } catch (error) {
    console.error('❌ Error fetching upcoming activities:', error.message);
    
    // Return cached data even if expired as fallback
    const staleCache = responseCache['activities'].data;
    if (staleCache) {
      console.log('⚠️ Returning stale cached activities due to error');
      return res.json(staleCache);
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for sleep data
app.get('/api/sleep-data', async (req, res) => {
  try {
    const { username, password } = req.query;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }
    
    console.log('😴 Fetching sleep data...');
    
    // Check cache first
    const cached = getCachedData('sleep-data');
    if (cached) {
      console.log('✓ Returning cached sleep data');
      return res.json(cached);
    }
    
    // Use per-user request queue to serialize requests
    const queue = getRequestQueue(username);
    const result = await queue.add(async () => {
      await delayRequest();
      const garmin = await initGarmin(username, password);
      
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
          
          console.log(`✓ Sleep score extracted: ${overallScore}`);
          setCachedData('sleep-data', result);
          return result;
        } else {
          const result = {
            sleepScore: 0,
            duration: 0,
            startTime: 0,
            sleepData: null
          };
          setCachedData('sleep-data', result);
          return result;
        }
      } catch (e) {
        console.log('⚠️ getSleepData failed, using getSleepDuration:', e.message);
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
        return result;
      }
    });
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error fetching sleep data:', error.message);
    
    // Return cached data even if expired as fallback
    const staleCache = responseCache['sleep-data'].data;
    if (staleCache) {
      console.log('⚠️ Returning stale cached sleep data due to error');
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
