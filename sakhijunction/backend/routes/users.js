import express from "express"
import { protect } from "../middleware/auth.js"
import User from "../models/User.js"

const router = express.Router()

// GET /api/users/profile - Get user profile (for token validation fallback)
router.get("/profile", protect, async (req, res) => {
  try {
    console.log("👤 Fetching profile for user:", req.user._id)

    const user = await User.findById(req.user._id).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      id: user._id,
      email: user.email,
      name: user.name || user.username || user.email.split("@")[0],
      username: user.username || user.email.split("@")[0],
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
    })
  } catch (error) {
    console.error("❌ Error fetching user profile:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    })
  }
})

export default router
