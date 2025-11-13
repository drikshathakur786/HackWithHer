import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { AiOutlineLoading } from "react-icons/ai";
import { useState } from "react";

const RegisterForm = ({ formData, handleChange, setUserInfo, setRedirect }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRegister = async () => {
    // Validation
    if (formData.confirmPassword !== formData.password) {
      toast("Passwords do not match", {
        type: "error",
        style: { backgroundColor: "#0f141e", color: "#fff", fontSize: 15 },
      });
      return;
    }

    // Check if all fields are filled
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast("Please fill in all fields", {
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
      
      console.log("Sending registration data:", {
        email: formData.email,
        password: "***hidden***" // Don't log actual password
      });

      const { data, status } = await axios.post("/api/auth/register", {
        email: formData.email,
        password: formData.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      console.log("Registration response:", { status, data });

      if (data.newUser && status === 201) {
        localStorage.setItem("token", data.token);
        setUserInfo(data.newUser);
        setRedirect("/profile");
        toast(data.message, {
          type: "success",
          style: { backgroundColor: "#0f141e", color: "#fff", fontSize: 15 },
        });
      } else {
        toast(data.message || "Registration failed", {
          type: "info",
          style: { backgroundColor: "#0f141e", color: "#fff", fontSize: 15 },
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error headers:", error.response?.headers);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          "Registration failed. Please try again.";
      
      toast(errorMessage, {
        type: "error",
        style: { backgroundColor: "#0f141e", color: "#fff", fontSize: 15 },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="Email"
        type="email"
        name="email"
        value={formData.email || ''}
        onChange={handleChange}
        required
      />
      <Input
        placeholder="Password"
        type="password"
        name="password"
        value={formData.password || ''}
        onChange={handleChange}
        required
        minLength={6}
      />
      <Input
        placeholder="Confirm password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword || ''}
        onChange={handleChange}
        required
      />
      <div className="">
        <Button
          className="w-full font-semibold mt-2"
          disabled={isLoading}
          onClick={handleRegister}
        >
          {isLoading && (
            <AiOutlineLoading className="animate-spin size-5 font-bold mr-3 text-white" />
          )}
          {isLoading ? "Please wait..." : "Register"}
        </Button>
      </div>
    </div>
  );
};

export default RegisterForm;