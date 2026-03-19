const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

const api = {
  get:  (path)        => request(path),
  post: (path, body)  => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:  (path, body)  => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  del:  (path)        => request(path, { method: 'DELETE' }),
};

export default api;
