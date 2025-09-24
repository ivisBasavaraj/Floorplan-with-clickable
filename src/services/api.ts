// API service for backend integration
import { FloorPlan } from '../types/canvas';

const API_BASE_URL = 'http://localhost:5000/api';

// Auth token management
let authToken: string | null = localStorage.getItem('auth_token');

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('auth_token', token);
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('auth_token');
};

export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
});

// API functions
export const authAPI = {
  async register(userData: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (response.ok && data.access_token) {
      setAuthToken(data.access_token);
    }
    return { success: response.ok, data };
  },

  async login(credentials: { username: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (response.ok && data.access_token) {
      setAuthToken(data.access_token);
    }
    return { success: response.ok, data };
  },

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    return { success: response.ok, data: await response.json() };
  },

  async verifyToken() {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: getAuthHeaders(),
    });
    return { success: response.ok, data: await response.json() };
  },

  logout() {
    clearAuthToken();
  },
};

export const floorPlanAPI = {
  async getFloorPlans(params?: {
    page?: number;
    limit?: number;
    search?: string;
    event_id?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.search) queryParams.set('search', params.search);
    if (params?.event_id) queryParams.set('event_id', params.event_id);

    const response = await fetch(
      `${API_BASE_URL}/floorplans?${queryParams}`,
      { headers: getAuthHeaders() }
    );
    const data = await response.json();
    return { success: response.ok, data };
  },

  async getFloorPlan(id: string) {
    const response = await fetch(`${API_BASE_URL}/floorplans/${id}`, {
      headers: getAuthHeaders(),
    });
    return { success: response.ok, data: await response.json() };
  },

  async createFloorPlan(floorPlan: {
    name: string;
    description?: string;
    event_id?: string;
    floor?: number;
    layer?: number;
    state?: any;
    status?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/floorplans`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(floorPlan),
    });
    return { success: response.ok, data: await response.json() };
  },

  async updateFloorPlan(id: string, updates: {
    name?: string;
    description?: string;
    state?: any;
    event_id?: string;
    floor?: number;
    layer?: number;
    status?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/floorplans/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return { success: response.ok, data: await response.json() };
  },

  async deleteFloorPlan(id: string) {
    const response = await fetch(`${API_BASE_URL}/floorplans/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return { success: response.ok, data: await response.json() };
  },

  async updateFloorPlanStatus(id: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/floorplans/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return { success: response.ok, data: await response.json() };
  },

  async getBoothDetails(id: string) {
    const response = await fetch(`${API_BASE_URL}/floorplans/${id}/booths`, {
      headers: getAuthHeaders(),
    });
    return { success: response.ok, data: await response.json() };
  },
};

// Public API (no authentication required)
export const publicFloorPlanAPI = {
  async getPublicFloorPlans(params?: {
    page?: number;
    limit?: number;
    search?: string;
    event_id?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.search) queryParams.set('search', params.search);
    if (params?.event_id) queryParams.set('event_id', params.event_id);

    const response = await fetch(
      `${API_BASE_URL}/public/floorplans?${queryParams}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    const data = await response.json();
    return { success: response.ok, data };
  },

  async getPublicFloorPlan(id: string) {
    const response = await fetch(`${API_BASE_URL}/public/floorplans/${id}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return { success: response.ok, data };
  },

  async getPublicCompanies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    floor?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.search) queryParams.set('search', params.search);
    if (params?.floor) queryParams.set('floor', params.floor.toString());

    const response = await fetch(
      `${API_BASE_URL}/public/companies?${queryParams}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    const data = await response.json();
    return { success: response.ok, data };
  },

  async getPublicSponsors() {
    const response = await fetch(`${API_BASE_URL}/public/sponsors`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return { success: response.ok, data };
  },
};

export const publicHallAPI = {
  async getPublicHalls(params?: { event_id?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.event_id) queryParams.set('event_id', params.event_id);
    const response = await fetch(
      `${API_BASE_URL}/public/halls?${queryParams}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    const data = await response.json();
    return { success: response.ok, data };
  },

  async getHallFloorPlans(hallId: string) {
    const response = await fetch(`${API_BASE_URL}/public/halls/${hallId}/floorplans`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return { success: response.ok, data };
  },
};

// Area Maps API
export const areaMapAPI = {
  async getAreaMaps() {
    const response = await fetch(`${API_BASE_URL}/area-maps`, {
      headers: getAuthHeaders(),
    });
    return { success: response.ok, data: await response.json() };
  },

  async uploadAreaMap(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/area-maps/upload`, {
      method: 'POST',
      headers: {
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
      body: formData,
    });
    return { success: response.ok, data: await response.json() };
  },

  async deleteAreaMap(filename: string) {
    const response = await fetch(`${API_BASE_URL}/area-maps/${filename}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return { success: response.ok, data: await response.json() };
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await fetch('http://localhost:5000/health');
    return { success: response.ok, data: await response.json() };
  } catch (error) {
    return { success: false, error };
  }
};