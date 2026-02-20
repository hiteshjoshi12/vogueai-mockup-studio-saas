import { MockupConfig } from "./types";

// Ensure you add VITE_API_URL=http://localhost:5000/api to your frontend .env file
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const generateMockup = async (
  compressedImage: string, // Expecting base64 string (Data URL)
  config: MockupConfig,
  token: string // The Redux JWT token required for backend authentication
): Promise<{ imageUrl: string; tokensRemaining: number }> => {
  
  if (!token) {
    throw new Error("Authentication error. Please log in again.");
  }

  try {
    // Make a secure POST request to your Node.js backend
    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Passes the JWT for the backend middleware
      },
      body: JSON.stringify({ 
        compressedImage, 
        config 
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Throw the specific error message sent by your Express backend (e.g., "Insufficient tokens")
      throw new Error(data.error || "An error occurred during generation on the server.");
    }

    // Return the generated image URL and the updated token balance from the database
    return {
      imageUrl: data.imageUrl,
      tokensRemaining: data.tokensRemaining
    };

  } catch (error: any) {
    console.error("Backend Service Error:", error);
    throw error;
  }
};