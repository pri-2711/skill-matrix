export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const BASE = `${API_BASE_URL}/api`;

async function request(path, options = {}) {
  const { customHeaders, ...restOptions } = options;
  const h = customHeaders !== undefined ? customHeaders : { 'Content-Type': 'application/json' };
  
  const res = await fetch(`${BASE}${path}`, {
    headers: { ...h, ...restOptions.headers },
    ...restOptions,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

const api = {
  get:  (path)        => request(path),
  post: (path, body)  => {
    const isFormData = body instanceof FormData;
    return request(path, { 
      method: 'POST',   
      body: isFormData ? body : JSON.stringify(body),
      customHeaders: isFormData ? {} : undefined
    });
  },
  put:  (path, body)  => {
    const isFormData = body instanceof FormData;
    return request(path, { 
      method: 'PUT',    
      body: isFormData ? body : JSON.stringify(body),
      customHeaders: isFormData ? {} : undefined
    });
  },
  del:  (path)        => request(path, { method: 'DELETE' }),
};

export default api;
