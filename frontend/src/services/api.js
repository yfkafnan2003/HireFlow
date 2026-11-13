
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Please check your connection."
    );
  }

  let data = null;

  try {
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text || null;
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("access_token");
    }

    const detail = data?.detail;

    let message = "Something went wrong. Please try again.";

    if (Array.isArray(detail)) {
      message = detail.map((error) => error.msg).join(", ");
    } else if (typeof detail === "string") {
      message = detail;
    } else if (typeof data === "string" && data) {
      message = data;
    }

    throw new Error(message);
  }

  return data;
}
