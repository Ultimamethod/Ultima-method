const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const password = event.headers['x-admin-password'];
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '110703';

  if (password !== ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const { type, data } = JSON.parse(event.body);

    if (type === 'schedule') {
      const store = getStore('schedule');
      await store.set('sessions', JSON.stringify(data));
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (type === 'coaches') {
      const store = getStore('coaches');
      await store.set('list', JSON.stringify(data));
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (type === 'application') {
      const store = getStore('applications');
      const raw = await store.get('list');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift({ ...data, id: Date.now().toString(), status: 'pending', submittedAt: new Date().toISOString() });
      await store.set('list', JSON.stringify(list));
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (type === 'application-status') {
      const store = getStore('applications');
      const raw = await store.get('list');
      const list = raw ? JSON.parse(raw) : [];
      const updated = list.map(a => a.id === data.id ? { ...a, status: data.status } : a);
      await store.set('list', JSON.stringify(updated));
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid type' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
