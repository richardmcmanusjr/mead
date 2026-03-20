# Garmin Connect Integration Setup

This guide walks you through setting up Garmin Connect OAuth2 integration for the Fueling Coach app.

## Prerequisites

- A Garmin account
- Access to [Garmin Developer Dashboard](https://developer.garmin.com/)

## Step 1: Register Your Application

1. Go to https://developer.garmin.com/ and sign in with your Garmin account
2. Click "Create New App"
3. Fill in the application details:
   - **App Name**: Fueling Coach
   - **Description**: Athletic fueling strategy planner powered by Garmin Connect data
   - **App Type**: Web
4. For the Callback URL, use:
   - **Development**: `http://localhost:5173/auth/callback`
   - **Production**: `https://yourdomain.com/auth/callback`

## Step 2: Get Your Credentials

After registering your app, you'll receive:
- **Client ID**: A unique identifier for your app
- **Client Secret**: A secret key for token exchange (keep this secure!)

## Step 3: Configure the App

1. Create a `.env` file in the `fueling-app` directory:

```bash
cp .env.example .env
```

2. Open `.env` and add your credentials:

```
VITE_GARMIN_CLIENT_ID=your_client_id_here
VITE_GARMIN_CLIENT_SECRET=your_client_secret_here
```

## Step 4: Run the Development Server

```bash
cd app/fueling-app
npm run dev
```

The app will start at `http://localhost:5173`

## Step 5: Test the Integration

1. Open the app in your browser
2. Click "Connect Garmin Account"
3. You'll be redirected to Garmin's login page
4. Sign in and authorize the app to access your activities
5. You'll be redirected back to the app with your access token
6. The app will automatically fetch your workout data

## How It Works

### OAuth2 Flow

1. **Authorization Request**: User clicks "Connect Garmin Account"
2. **User Authentication**: User logs in with their Garmin credentials
3. **Authorization Grant**: User approves app permissions
4. **Token Exchange**: App exchanges authorization code for access token
5. **API Calls**: App uses access token to fetch workout data
6. **Token Refresh**: Access tokens are automatically refreshed when expired

### Data Flow

```
Garmin Connect API
        ↓
   garminAuth.js (OAuth2)
        ↓
   garminData.js (Data fetching)
        ↓
      App.jsx (Display)
```

### What Data Is Fetched

- **User Profile**: Weight, name, gender
- **Today's Activities**: Workouts scheduled for today
- **Upcoming Activities**: Training schedule for the next 7 days
- **Activity Details**: Duration, intensity, estimated calories

## Security Notes

### Storing Credentials

Currently, tokens are stored in `localStorage`, which is sufficient for a single-user web app. For production with multiple users:

1. Use a backend server to handle OAuth token exchange
2. Store tokens in secure, httpOnly cookies
3. Never expose `VITE_GARMIN_CLIENT_SECRET` to the client
4. Implement proper CORS and CSRF protection

### Environment Variables

- `VITE_GARMIN_CLIENT_ID` can be public (visible in client-side code)
- `VITE_GARMIN_CLIENT_SECRET` should only be used on a backend server
- In production, use your hosting platform's secure environment variable feature

## Troubleshooting

### "Client ID not configured"

Make sure you've created a `.env` file with `VITE_GARMIN_CLIENT_ID` set.

### "Invalid redirect URI"

The redirect URI must exactly match what you configured in the Garmin Developer Dashboard. Check:
- Protocol (http vs https)
- Domain and port
- Path (`/auth/callback`)

### "Token expired" errors

The app automatically refreshes tokens, but if you see this error:

1. Clear browser localStorage: `localStorage.clear()`
2. Disconnect and reconnect your Garmin account
3. Check your app's token refresh token is still valid

### No workouts showing up

1. Make sure you have workouts scheduled in your Garmin Connect calendar
2. Check the browser console for API errors
3. Verify your Garmin account has activities visible in the Garmin Connect app

## API Reference

See the following files for implementation details:

- [garminAuth.js](./src/services/garminAuth.js) - OAuth2 flow
- [garminData.js](./src/services/garminData.js) - Data fetching and formatting

## Garmin Connect API Documentation

For more information about the Garmin Connect API:
- https://developer.garmin.com/
- API Docs: Check your app dashboard for API documentation

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your `.env` file has the correct credentials
3. Check that your app is registered in the Garmin Developer Dashboard
4. Ensure your redirect URI matches exactly
