import mongoose from "mongoose"

const cycleDataSchema = new mongoose.Schema(
  {
    currentPhase: { type: String, default: "Follicular" },
    currentDay: { type: Number, default: 8 },
    cycleLength: { type: Number, default: 28 },
    lastPeriod: { type: Date, default: Date.now },
    nextPeriod: { type: Date },
    ovulation: { type: Date },
    periodLength: { type: Number, default: 5 },
    lutealPhaseLength: { type: Number, default: 14 },
  },
  { _id: false },
)

const symptomSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    category: { type: String, required: true },
    type: { type: String, required: true },
    intensity: { type: String, enum: ["mild", "moderate", "severe"], default: "moderate" },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { _id: false },
)

const moodSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    mood: { type: String, required: true },
    energy: { type: Number, min: 1, max: 10, default: 5 },
    stress: { type: Number, min: 1, max: 10, default: 3 },
    anxiety: { type: Number, min: 1, max: 10, default: 2 },
    notes: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { _id: false },
)

const waterIntakeSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    goal: { type: Number, default: 2000 },
  },
  { _id: false },
)

const sleepDataSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    bedtime: { type: String, required: true },
    wakeTime: { type: String, required: true },
    quality: { type: Number, min: 1, max: 10, default: 7 },
    duration: { type: Number }, // calculated hours
    notes: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { _id: false },
)

const weightDataSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    weight: { type: Number, required: true },
    unit: { type: String, enum: ["kg", "lbs"], default: "kg" },
    date: { type: Date, default: Date.now },
  },
  { _id: false },
)

const exerciseDataSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    type: { type: String, required: true },
    duration: { type: Number, required: true }, // minutes
    intensity: { type: String, enum: ["light", "moderate", "vigorous"], default: "moderate" },
    calories: { type: Number },
    notes: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { _id: false },
)

const medicationSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, enum: ["daily", "twice-daily", "weekly", "as-needed"], default: "daily" },
    time: { type: String, required: true },
    notes: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { _id: false },
)

const temperatureDataSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    temperature: { type: Number, required: true },
    time: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false },
)

const journalEntrySchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    title: { type: String, default: "" },
    content: { type: String, required: true },
    mood: { type: String, default: "neutral" },
    date: { type: Date, default: Date.now },
  },
  { _id: false },
)

const settingsSchema = new mongoose.Schema(
  {
    notifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
    reminderTimes: {
      water: { type: String, default: "09:00" },
      medication: { type: String, default: "08:00" },
      sleep: { type: String, default: "21:30" },
      mood: { type: String, default: "20:00" },
    },
    units: {
      weight: { type: String, enum: ["kg", "lbs"], default: "kg" },
      temperature: { type: String, enum: ["celsius", "fahrenheit"], default: "celsius" },
    },
  },
  { _id: false },
)

const healthDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    cycleData: { type: cycleDataSchema, default: () => ({}) },
    symptoms: { type: [symptomSchema], default: [] },
    moods: { type: [moodSchema], default: [] },
    waterIntake: { type: [waterIntakeSchema], default: [] },
    sleepData: { type: [sleepDataSchema], default: [] },
    weightData: { type: [weightDataSchema], default: [] },
    exerciseData: { type: [exerciseDataSchema], default: [] },
    medications: { type: [medicationSchema], default: [] },
    temperatureData: { type: [temperatureDataSchema], default: [] },
    journalEntries: { type: [journalEntrySchema], default: [] },
    customSymptomsList: { type: [String], default: [] },
    settings: { type: settingsSchema, default: () => ({}) },
    dailyWaterGoal: { type: Number, default: 2000 },
    waterGlassSize: { type: Number, default: 250 },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "health_data",
  },
)

// Indexes for better performance
healthDataSchema.index({ userId: 1 })
healthDataSchema.index({ "symptoms.date": 1 })
healthDataSchema.index({ "moods.date": 1 })
healthDataSchema.index({ lastUpdated: 1 })

// Pre-save middleware to update lastUpdated
healthDataSchema.pre("save", function (next) {
  this.lastUpdated = new Date()
  next()
})

// Method to initialize default data for new user
healthDataSchema.methods.initializeDefaults = function () {
  if (!this.cycleData || Object.keys(this.cycleData).length === 0) {
    this.cycleData = {
      currentPhase: "Follicular",
      currentDay: 8,
      cycleLength: 28,
      lastPeriod: new Date(),
      nextPeriod: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      ovulation: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      periodLength: 5,
      lutealPhaseLength: 14,
    }
  }

  if (!this.settings || Object.keys(this.settings).length === 0) {
    this.settings = {
      notifications: true,
      darkMode: false,
      reminderTimes: {
        water: "09:00",
        medication: "08:00",
        sleep: "21:30",
        mood: "20:00",
      },
      units: {
        weight: "kg",
        temperature: "celsius",
      },
    }
  }
}

const HealthData = mongoose.model("HealthData", healthDataSchema)

export default HealthData
