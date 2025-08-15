const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8080"
    : "https://e-library-qdpj.onrender.com";

const fetchWithCreds = (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: "include", // ✅ send cookies with every request
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
};

const UserApi = {
  borrowBook: async (isbn, userId) => {
    const res = await fetchWithCreds(`${API_BASE_URL}/v1/user/borrow`, {
      method: "POST",
      body: JSON.stringify({ isbn, userId }),
    });
    return res.json();
  },

  returnBook: async (isbn, userId) => {
    const res = await fetchWithCreds(`${API_BASE_URL}/v1/user/return`, {
      method: "POST",
      body: JSON.stringify({ isbn, userId }),
    });
    return res.json();
  },

  getBorrowBook: async () => {
    const res = await fetchWithCreds(`${API_BASE_URL}/v1/user/borrowed-books`);
    return res.json();
  },

  login: async (username, password) => {
    const res = await fetchWithCreds(`${API_BASE_URL}/v1/user/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  getProfile: async () => {
    const res = await fetchWithCreds(`${API_BASE_URL}/v1/user/profile`);
    return res.json();
  },

  logout: async () => {
    const res = await fetchWithCreds(`${API_BASE_URL}/v1/user/logout`);
    return res.json();
  },
};

export { UserApi };
