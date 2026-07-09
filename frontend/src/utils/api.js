export async function apiFetch(apiUrl, path, options = {}) {
  const user = JSON.parse(sessionStorage.getItem("tg_user") || "null");
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
  };
  if (user?.id) {
    headers["X-User-Id"] = user.id.toString();
  }
  const res = await fetch(`${apiUrl}${path}`, { ...options, headers });
  return res.json();
}
