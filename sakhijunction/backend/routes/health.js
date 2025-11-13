import express from "express"
import { protect } from "../middleware/auth.js"
import HealthData from "../models/HealthData.js"

const router = express.Router()

// Get user's health data
router.get("/", protect, async (req, res) => {
  try {
    console.log("=== GET HEALTH DATA ===")
    console.log("User ID:", req.user._id)
    console.log("User Email:", req.user.email)

    const userId = req.user._id
    let healthData = await HealthData.findOne({ userId })

    if (!healthData) {
      console.log("No health data found, creating new document with defaults")

      // Create new health data with defaults
      healthData = new HealthData({
        userId: userId,
      })

      // Initialize defaults
      healthData.initializeDefaults()

      // Save the new document
      await healthData.save()
      console.log("Created new health data document")
    }

    console.log("Health data found, returning data")

    // Return clean data object without MongoDB internals
    const cleanData = {
      cycleData: healthData.cycleData || {},
      symptoms: healthData.symptoms || [],
      moods: healthData.moods || [],
      waterIntake: healthData.waterIntake || [],
      sleepData: healthData.sleepData || [],
      weightData: healthData.weightData || [],
      exerciseData: healthData.exerciseData || [],
      medications: healthData.medications || [],
      temperatureData: healthData.temperatureData || [],
      journalEntries: healthData.journalEntries || [],
      customSymptomsList: healthData.customSymptomsList || [],
      settings: healthData.settings || {},
      dailyWaterGoal: healthData.dailyWaterGoal || 2000,
      waterGlassSize: healthData.waterGlassSize || 250,
      lastUpdated: healthData.lastUpdated,
    }

    // Return with the exact structure that frontend expects
    res.status(200).json({
      success: true,
      ...cleanData, // Spread the data directly, not nested under 'data'
    })
  } catch (error) {
    console.error("Error fetching health data:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch health data",
      error: error.message,
    })
  }
})

// Save/Update user's health data
router.post("/", protect, async (req, res) => {
  try {
    console.log("=== SAVE HEALTH DATA ===")
    console.log("User ID:", req.user._id)
    console.log("User Email:", req.user.email)
    console.log("Request body keys:", Object.keys(req.body))

    const userId = req.user._id

    // Handle both nested and direct data formats
    const healthDataToSave = req.body.data || req.body.healthData || req.body

    if (!healthDataToSave) {
      console.log("No data provided in request body")
      return res.status(400).json({
        success: false,
        message: "No data provided",
      })
    }

    console.log("Data keys to save:", Object.keys(healthDataToSave))

    // Find existing health data or create new
    let healthData = await HealthData.findOne({ userId })

    if (healthData) {
      console.log("Updating existing health data")

      // Update each field if provided
      if (healthDataToSave.cycleData !== undefined) {
        healthData.cycleData = {
          ...healthData.cycleData,
          ...healthDataToSave.cycleData,
        }
      }

      if (healthDataToSave.symptoms !== undefined) healthData.symptoms = healthDataToSave.symptoms
      if (healthDataToSave.moods !== undefined) healthData.moods = healthDataToSave.moods
      if (healthDataToSave.waterIntake !== undefined) healthData.waterIntake = healthDataToSave.waterIntake
      if (healthDataToSave.sleepData !== undefined) healthData.sleepData = healthDataToSave.sleepData
      if (healthDataToSave.weightData !== undefined) healthData.weightData = healthDataToSave.weightData
      if (healthDataToSave.exerciseData !== undefined) healthData.exerciseData = healthDataToSave.exerciseData
      if (healthDataToSave.medications !== undefined) healthData.medications = healthDataToSave.medications
      if (healthDataToSave.temperatureData !== undefined) healthData.temperatureData = healthDataToSave.temperatureData
      if (healthDataToSave.journalEntries !== undefined) healthData.journalEntries = healthDataToSave.journalEntries
      if (healthDataToSave.customSymptomsList !== undefined)
        healthData.customSymptomsList = healthDataToSave.customSymptomsList

      if (healthDataToSave.settings !== undefined) {
        healthData.settings = {
          ...healthData.settings,
          ...healthDataToSave.settings,
        }
      }

      if (healthDataToSave.dailyWaterGoal !== undefined) healthData.dailyWaterGoal = healthDataToSave.dailyWaterGoal
      if (healthDataToSave.waterGlassSize !== undefined) healthData.waterGlassSize = healthDataToSave.waterGlassSize

      healthData.lastUpdated = new Date()
    } else {
      console.log("Creating new health data")

      // Create new health data
      healthData = new HealthData({
        userId: userId,
        ...healthDataToSave,
        lastUpdated: new Date(),
      })

      // Initialize any missing defaults
      healthData.initializeDefaults()
    }

    // Validate and save
    await healthData.save()
    console.log("Health data saved successfully")

    res.status(200).json({
      success: true,
      message: "Health data saved successfully",
      lastUpdated: healthData.lastUpdated,
    })
  } catch (error) {
    console.error("Error saving health data:", error)

    // Handle validation errors specifically
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to save health data",
      error: error.message,
    })
  }
})

// Delete user's health data
router.delete("/", protect, async (req, res) => {
  try {
    const userId = req.user._id
    const result = await HealthData.deleteOne({ userId })

    res.status(200).json({
      success: true,
      message: "Health data cleared successfully",
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error clearing health data:", error)
    res.status(500).json({
      success: false,
      message: "Failed to clear health data",
      error: error.message,
    })
  }
})

export default router
