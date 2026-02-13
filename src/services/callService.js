import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const callService = {
  // Check if a user is available for a call
  checkUserAvailability: async (username) => {
    try {
      const token = authService.getAccessToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/call/check-availability/${username}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to check user availability');
      }

      const data = await response.json();
      return data; // { available: boolean, user: { username, profilePicture } }
    } catch (error) {
      throw error;
    }
  },

  // Initiate a call to another user
  initiateCall: async (targetUsername) => {
    try {
      const token = authService.getAccessToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/call/initiate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ targetUsername }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate call');
      }

      const data = await response.json();
      return data; // { callId, sdpOffer }
    } catch (error) {
      throw error;
    }
  },

  // End a call
  endCall: async (callId) => {
    try {
      const token = authService.getAccessToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/call/end`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ callId }),
      });

      if (!response.ok) {
        throw new Error('Failed to end call');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Send call transcript
  saveTranscript: async (callId, transcript) => {
    try {
      const token = authService.getAccessToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/call/transcript`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ callId, transcript }),
      });

      if (!response.ok) {
        throw new Error('Failed to save transcript');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};
