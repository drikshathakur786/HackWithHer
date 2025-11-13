import jwt from "jsonwebtoken"
import User from "../models/User.js"

// Simple async handler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// Protect routes - check for valid JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  // Check for token in cookies (if using cookie authentication)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    })
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("🔐 Token decoded:", { userId: decoded.userId || decoded.id })

    // Get user from database
    const user = await User.findById(decoded.userId || decoded.id).select("-password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No user found with this token",
      })
    }

    // Check if user account is active (only if isActive field exists)
    if (user.isActive !== undefined && !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User account has been deactivated",
      })
    }

    console.log("✅ User authenticated:", { id: user._id, email: user.email })

    // Add user to request object
    req.user = user
    next()
  } catch (error) {
    console.error("❌ Token verification failed:", error.message)
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    })
  }
})

// Check if user is email verified
export const requireEmailVerification = (req, res, next) => {
  if (req.user.isEmailVerified !== undefined && !req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email address to access this feature",
    })
  }
  next()
}

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      })
    }
    next()
  }
}

// Optional authentication - doesn't fail if no token
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.userId || decoded.id)

      if (user && (user.isActive === undefined || user.isActive)) {
        req.user = user
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }
  }
  next()
})

// Check if user owns the resource or is admin
export const checkOwnership = (resourceModel, userField = "author") => {
  return asyncHandler(async (req, res, next) => {
    const resource = await resourceModel.findById(req.params.id)

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    // Check if user owns the resource or is admin
    if (resource[userField].toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this resource",
      })
    }

    req.resource = resource
    next()
  })
}
