import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineLoading } from "react-icons/ai";

const LoginForm = ({ formData, handleChange, setUserInfo }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleLogin = async () => {
    // Input validation
    if (!formData.email || !formData.password) {
      toast("Please provide all credentials", {
        type: "error",
        style: { backgroundColor: "#0f141e", color: "#fff", fontSize: 15 },
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast("Please enter a valid email address", {
        type: "error",
        style: { backgroundColor: "#0f141e", color: "#fff", fontSize: 15 },
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await axios.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const { data, status } = response;

      // Check if login was successful
      if (status === 200 && data.token && data.user) {
        // Store authentication token
        localStorage.setItem("token", data.token);
        
        // Set user information
        const userId = data.user.id || data.user._id;
        setUserInfo({
          id: userId,
          email: data.user.email,
          createdAt: data.user.createdAt,
          lastLogin: data.user.lastLogin,
          role: data.user.role || 'user'
        });
        
        // Show success message
        toast(data.message || "Login successful!", {
          type: "success",
          style: { backgroundColor: "#0f141e", color: "#fff", fontSize: 15 },
        });
        
        // Navigate to home page
        navigate("/home", { replace: true });
        return;
        
      } else if (status === 201) {
        // This indicates request went to register endpoint
        toast("ERROR: Login request went to registration endpoint. Check your routes!", {
          type: "error",
          style: { backgroundColor: "#ff0000", color: "#fff", fontSize: 15 },
        });
      } else {
        toast(data.message || "Login failed", {
          type: "error",
          style: { backgroundColor: "#0f141e", color: "#fff", fontSize: 15 },
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Check if error indicates wrong endpoint
      const errorMessage = error.response?.data?.message || "";
      if (errorMessage.includes("already exists")) {
        toast("ERROR: Login is hitting registration endpoint! Check your backend routes.", {
          type: "error",
          style: { backgroundColor: "#ff0000", color: "#fff", fontSize: 15 },
        });
        return;
      }
      
      // Handle different error types
      let displayMessage = "Login failed. Please try again.";
      
      if (error.response?.status === 401) {
        displayMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.response?.status === 400) {
        displayMessage = error.response.data.message || "Please check your credentials";
      } else if (error.response?.status === 404) {
        displayMessage = "Login endpoint not found. Server configuration issue.";
      } else if (error.response?.status === 500) {
        displayMessage = "Server error. Please try again later.";
      } else if (error.code === 'ECONNABORTED') {
        displayMessage = "Request timeout. Please check your connection.";
      } else if (error.response?.data?.message) {
        displayMessage = error.response.data.message;
      }

      toast(displayMessage, {
        type: "error",
        style: { backgroundColor: "#0f141e", color: "#fff", fontSize: 15 },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="space-y-3">
      <Input
        placeholder="Email"
        type="email"
        name="email"
        value={formData.email || ''}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        required
        autoComplete="email"
      />
      <Input
        placeholder="Password"
        type="password"
        name="password"
        value={formData.password || ''}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        required
        autoComplete="current-password"
      />
      <div>
        <Button
          onClick={handleLogin}
          className="w-full font-semibold mt-4 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading && (
            <AiOutlineLoading className="animate-spin size-5 font-bold mr-3 text-white" />
          )}
          {isLoading ? "Checking credentials..." : "Login"}
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;