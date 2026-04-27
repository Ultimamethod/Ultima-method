const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const password = event.headers['x-admin-password'];
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '110703';

  try {
    const type = event.queryStringParameters?.type;

    if (type === 'schedule') {
      const store = getStore('schedule');
      const raw = await store.get('sessions');
      const sessions = raw ? JSON.parse(raw) : getDefaultSessions();
      return { statusCode: 200, headers, body: JSON.stringify(sessions) };
    }

    if (type === 'coaches') {
      const store = getStore('coaches');
      const raw = await store.get('list');
      const coaches = raw ? JSON.parse(raw) : [];
      return { statusCode: 200, headers, body: JSON.stringify(coaches) };
    }

    if (type === 'applications') {
      if (password !== ADMIN_PASSWORD) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
      const store = getStore('applications');
      const raw = await store.get('list');
      const applications = raw ? JSON.parse(raw) : [];
      return { statusCode: 200, headers, body: JSON.stringify(applications) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid type' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

function getDefaultSessions() {
  return [
    { id: '1', day: 'Monday',    time: '06:00', name: 'Full Body Equilibrium', coach: 'Elise Marlowe', phase: 'foundation', duration: '60 min', spots: 8, spotsLeft: 8 },
    { id: '2', day: 'Tuesday',   time: '07:30', name: 'Lower Body Forge',      coach: 'Damien Cross',  phase: 'precision',   duration: '75 min', spots: 6, spotsLeft: 3 },
    { id: '3', day: 'Wednesday', time: '18:00', name: 'Core Ignition',         coach: 'Elise Marlowe', phase: 'foundation', duration: '60 min', spots: 12, spotsLeft: 12 },
    { id: '4', day: 'Thursday',  time: '06:30', name: 'Upper Body Strength',   coach: 'Damien Cross',  phase: 'apex',        duration: '90 min', spots: 5, spotsLeft: 2 },
    { id: '5', day: 'Friday',    time: '07:00', name: 'Glutes & Arms Forge',   coach: 'Nadia Voss',    phase: 'precision',   duration: '75 min', spots: 8, spotsLeft: 6 },
    { id: '6', day: 'Saturday',  time: '08:00', name: 'Apex · Stratosphere',   coach: 'Nadia Voss',    phase: 'apex',        duration: '90 min', spots: 10, spotsLeft: 10 },
  ];
}
