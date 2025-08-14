const API_BASE_URL = 'https://festivize-backend.onrender.com'; // Replace with your backend URL

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.statusCode = response.status;
    throw error;
  }
  return data;
};

// Auth Endpoints
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const register = async (name, email, password, role) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  return handleResponse(response);
};

//Year Management Endpoints 
export const getYears = async () => {
  const response = await fetch(`${API_BASE_URL}/years`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const createYear = async (yearData) => {
  const response = await fetch(`${API_BASE_URL}/years`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(yearData),
  });
  return handleResponse(response);
};

export const updateYearStatus = async (year, statusData) => {
  const response = await fetch(`${API_BASE_URL}/years/${year}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(statusData),
  });
  return handleResponse(response);
};

// Received Items Endpoints
export const getReceivedItems = async (year) => {
  const query = year ? `?year=${year}` : '';
  const response = await fetch(`${API_BASE_URL}/receiveditems${query}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const addReceivedItem = async (itemData) => {
  const response = await fetch(`${API_BASE_URL}/receiveditem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(itemData),
  });
  return handleResponse(response);
};

export const updateReceivedItem = async (id, itemData) => {
  const response = await fetch(`${API_BASE_URL}/receiveditem/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(itemData),
  });
  return handleResponse(response);
};

export const deleteReceivedItem = async (id) => {
  const response = await fetch(`${API_BASE_URL}/receiveditem/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Expenditure Endpoints
export const getExpenditures = async (year) => {
  const query = year ? `?year=${year}` : '';
  const response = await fetch(`${API_BASE_URL}/expenditure${query}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const addExpenditure = async (expenditureData) => {
  const response = await fetch(`${API_BASE_URL}/expenditure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(expenditureData),
  });
  return handleResponse(response);
};

export const updateExpenditure = async (id, expenditureData) => {
  const response = await fetch(`${API_BASE_URL}/expenditure/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(expenditureData),
  });
  return handleResponse(response);
};

export const deleteExpenditure = async (id) => {
  const response = await fetch(`${API_BASE_URL}/expenditure/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Home endpoint (example)
export const getHomeMessage = async () => {
  const response = await fetch(`${API_BASE_URL}/home`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Image Upload Endpoints
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file); // The field name 'photo' MUST match your multer.single('photo') in the backend route.

  const response = await fetch(`${API_BASE_URL}/upload`, { // Assuming your route is '/upload'
    method: 'POST',
    headers: { ...getAuthHeaders() }, // Do NOT set 'Content-Type': 'multipart/form-data' explicitly; the browser does it automatically with FormData
    body: formData,
  });
  return handleResponse(response);
}; 

// Fetch all images
export const getAllImages = async () => {
  const response = await fetch(`${API_BASE_URL}/images`, { // Assuming your route is /images
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};