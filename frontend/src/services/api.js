const API_URL = 'http://localhost:5000/api';

export async function registerUser(username, email, password) {
    const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Đăng ký thất bại');
    return data;
}

export async function loginUser(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại');
    return data;
}
export async function uploadTrainingSamples(samples, token) {
  const res = await fetch(`${API_URL}/training-samples/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(samples)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload thất bại');
  return data;
}

export async function fetchTrainingSamples() {
  const res = await fetch(`${API_URL}/training-samples`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function clearTrainingSamples(token) {
  const res = await fetch(`${API_URL}/training-samples`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Xóa thất bại');
  return data;
}
export async function savePracticeResult(result, token) {
  const res = await fetch(`${API_URL}/practice/results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(result)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lưu kết quả luyện tập thất bại');
  return data;
}

export async function fetchPracticeStats(token) {
  const res = await fetch(`${API_URL}/practice/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Không tải được thống kê luyện tập');
  return data;
}
