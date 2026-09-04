import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1/flood';

export const fetchDistricts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/districts`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch districts:', error);
    throw error;
  }
};

export const fetchDashboardData = async (district = 'Coimbatore') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard`, {
      params: { district }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch dashboard data for ${district}:`, error);
    throw error;
  }
};

export const subscribeAlert = async (subscriptionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/alert-subscribe`, subscriptionData);
    return response.data;
  } catch (error) {
    console.error('Failed to submit alert subscription:', error);
    throw error;
  }
};
