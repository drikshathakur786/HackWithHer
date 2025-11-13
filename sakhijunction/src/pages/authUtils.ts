// authUtils.ts - Improved authentication utilities
export const checkAuthStatus = async () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
  if (!token) {
    console.log("❌ No token found");
    return { isAuthenticated: false, error: "No token found" };
  }
  
  try {
    console.log("🔍 Checking auth status with token");
    
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("🔍 Auth check response:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      contentType: response.headers.get('content-type')
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log("✅ User authenticated:", user.email || user.id);
      return { 
        isAuthenticated: true, 
        user,
        token 
      };
    } else {
      console.log("❌ Authentication failed:", response.status, response.statusText);
      
      // Log the response text to see what we're getting
      const responseText = await response.text();
      console.log("Response content:", responseText.substring(0, 200) + "...");
      
      // If token is invalid, remove it
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }
      
      return { 
        isAuthenticated: false, 
        error: `Auth failed: ${response.status} ${response.statusText}` 
      };
    }
  } catch (error) {
    console.error("❌ Auth check error:", error);
    return { 
      isAuthenticated: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Clear all authentication data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  console.log("🧹 Authentication data cleared");
};

// Store authentication token
export const storeAuthToken = (token: string) => {
  localStorage.setItem('token', token);
  console.log("💾 Token stored in localStorage");
};

// Get stored authentication token
export const getAuthToken = (): string | null => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

// Check if user is currently authenticated (synchronous check)
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

// Login function
export const loginUser = async (email: string, password: string) => {
  try {
    console.log("🔄 Attempting login for:", email);
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    console.log("📝 Login response:", { status: response.status, hasToken: !!result.token });
    
    if (response.ok && result.token && result.user) {
      // Store token
      storeAuthToken(result.token);
      
      // Verify authentication
      const authCheck = await checkAuthStatus();
      
      if (authCheck.isAuthenticated) {
        console.log("✅ Login successful and verified");
        return {
          success: true,
          user: result.user,
          token: result.token,
          message: result.message || 'Login successful'
        };
      } else {
        console.error("❌ Login succeeded but verification failed");
        clearAuthData();
        return {
          success: false,
          error: 'Login verification failed'
        };
      }
    } else {
      console.error("❌ Login failed:", result.message);
      return {
        success: false,
        error: result.message || 'Login failed'
      };
    }
  } catch (error) {
    console.error("❌ Login error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
};

// Logout function
export const logoutUser = async () => {
  try {
    const token = getAuthToken();
    
    if (token) {
      // Optional: Call logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Clear local authentication data
    clearAuthData();
    
    console.log("👋 User logged out");
    return { success: true };
  } catch (error) {
    console.error("❌ Logout error:", error);
    // Still clear local data even if server request fails
    clearAuthData();
    return { success: true };
  }
};