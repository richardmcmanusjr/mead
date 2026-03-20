import GarminConnect from 'garmin-connect';
import dotenv from 'dotenv';

dotenv.config();

const gc = new GarminConnect.GarminConnect({
  username: process.env.VITE_GARMIN_USERNAME,
  password: process.env.VITE_GARMIN_PASSWORD,
});

await gc.login();

const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(gc))
  .filter(m => !m.startsWith('_') && m !== 'constructor')
  .sort();

console.log('Available methods:');
console.log(methods);

// Test some methods
console.log('\n\nTesting methods:');

try {
  console.log('1. getUserProfile:');
  const profile = await gc.getUserProfile();
  console.log('  Success:', profile.displayName);
} catch (e) {
  console.log('  Error:', e.message);
}

try {
  console.log('2. getSleepDuration:');
  const sleep = await gc.getSleepDuration(new Date());
  console.log('  Success:', sleep);
} catch (e) {
  console.log('  Error:', e.message);
}

try {
  console.log('3. getActivities:');
  const activities = await gc.getActivities(0, 10);
  console.log('  Success, count:', activities.length);
} catch (e) {
  console.log('  Error:', e.message);
}

try {
  console.log('4. getDailyWeightInPounds:');
  const weight = await gc.getDailyWeightInPounds();
  console.log('  Success:', weight);
} catch (e) {
  console.log('  Error:', e.message);
}

try {
  console.log('5. getSteps:');
  const steps = await gc.getSteps();
  console.log('  Success:', steps);
} catch (e) {
  console.log('  Error:', e.message);
}
