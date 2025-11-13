"use client"

import { useState, useEffect, useRef } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Toaster, toast } from "sonner"
import {
  CalendarIcon,
  DropletIcon,
  ThermometerIcon,
  Trash2Icon,
  PlusIcon,
  XIcon,
  SmileIcon,
  GlassWaterIcon,
  MoonIcon,
  ActivityIcon,
  PillIcon,
  BookOpenIcon,
  SettingsIcon,
  DownloadIcon,
  UploadIcon,
  TrendingUpIcon,
  HeartIcon,
  ZapIcon,
  BarChart3Icon,
} from "lucide-react"

// --- API Helpers for MongoDB persistence ---
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/health`;

const getToken = () => {
  if (typeof window !== "undefined") {
    // Check both localStorage and sessionStorage
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  }
  return null;
}

async function fetchHealthData() {
  try {
    const token = getToken();
    console.log("🔍 Fetching health data...", { hasToken: !!token, apiUrl: API_URL });
    
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No authentication token found");
      return {};
    }

    const res = await fetch(API_URL, { headers });
    console.log("📡 API Response status:", res.status);

    if (!res.ok) {
      if (res.status === 401) {
        console.error("🚫 Unauthorized - invalid or expired token");
        throw new Error("Authentication required");
      }
      if (res.status === 404) {
        console.log("📝 No data found, returning empty object");
        return {};
      }
      const errorText = await res.text();
      console.error("❌ API Error:", res.status, errorText);
      throw new Error(`Failed to load data: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    console.log("✅ Successfully fetched health data:", Object.keys(data));
    return data;
  } catch (error) {
    console.error("💥 Error fetching health data:", error);
    throw error;
  }
}

async function saveHealthData(data) {
  try {
    const token = getToken();
    console.log("💾 Saving health data...", { hasToken: !!token, dataKeys: Object.keys(data) });
    
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      console.error("🚫 No authentication token found for saving");
      throw new Error("Authentication required");
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ data }),
    });

    console.log("📡 Save response status:", res.status);

    if (!res.ok) {
      if (res.status === 401) {
        console.error("🚫 Unauthorized during save");
        throw new Error("Authentication required");
      }
      const errorText = await res.text();
      console.error("❌ Save Error:", res.status, errorText);
      throw new Error(`Failed to save data: ${res.status} - ${errorText}`);
    }

    const result = await res.json();
    console.log("✅ Successfully saved health data");
    return result;
  } catch (error) {
    console.error("💥 Error saving health data:", error);
    throw error;
  }
}

export default function EnhancedHealthTracker() {
  // Core state management
  const [date, setDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Cycle tracking state
  const [cycleData, setCycleData] = useState({
    currentPhase: "Follicular",
    currentDay: 8,
    cycleLength: 28,
    lastPeriod: new Date("2024-03-18"),
    nextPeriod: new Date("2024-04-15"),
    ovulation: new Date("2024-04-01"),
    periodLength: 5,
    lutealPhaseLength: 14,
  })

  // Symptoms state
  const [symptoms, setSymptoms] = useState([])
  const [newSymptom, setNewSymptom] = useState({
    category: "physical",
    type: "",
    intensity: "moderate",
    date: new Date(),
    notes: "",
  })

  // Mood tracking state
  const [moods, setMoods] = useState([])
  const [dailyMood, setDailyMood] = useState({
    mood: "neutral",
    energy: 5,
    stress: 3,
    anxiety: 2,
    notes: "",
    date: new Date(),
  })

  // Water intake state
  const [waterIntake, setWaterIntake] = useState([])
  const [dailyWaterGoal, setDailyWaterGoal] = useState(2000) // ml
  const [waterGlassSize, setWaterGlassSize] = useState(250) // ml

  // Sleep tracking state
  const [sleepData, setSleepData] = useState([])
  const [sleepEntry, setSleepEntry] = useState({
    bedtime: "22:00",
    wakeTime: "07:00",
    quality: 7,
    notes: "",
    date: new Date(),
  })

  // Weight tracking state
  const [weightData, setWeightData] = useState([])
  const [weightEntry, setWeightEntry] = useState({
    weight: "",
    unit: "kg",
    date: new Date(),
  })

  // Exercise tracking state
  const [exerciseData, setExerciseData] = useState([])
  const [exerciseEntry, setExerciseEntry] = useState({
    type: "cardio",
    duration: "",
    intensity: "moderate",
    calories: "",
    notes: "",
    date: new Date(),
  })

  // Medication tracking state
  const [medications, setMedications] = useState([])
  const [medicationEntry, setMedicationEntry] = useState({
    name: "",
    dosage: "",
    frequency: "daily",
    time: "08:00",
    notes: "",
  })

  // Temperature tracking state
  const [temperatureData, setTemperatureData] = useState([])
  const [temperatureEntry, setTemperatureEntry] = useState({
    temperature: "",
    time: "06:00",
    date: new Date(),
  })

  // Notes/Journal state
  const [journalEntries, setJournalEntries] = useState([])
  const [journalEntry, setJournalEntry] = useState({
    title: "",
    content: "",
    mood: "neutral",
    date: new Date(),
  })

  // Settings state
  const [settings, setSettings] = useState({
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
  })

  // Custom symptoms state
  const [customSymptom, setCustomSymptom] = useState("")
  const [customSymptomsList, setCustomSymptomsList] = useState([])
  const customSymptomInputRef = useRef(null)

  // --- Load data from MongoDB on mount ---
 // --- Load data from MongoDB on mount ---
useEffect(() => {
  const loadData = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      console.log("Starting data load...");
      const data = await fetchHealthData();
      console.log("Data loaded successfully");

      // Parse dates and set state
      if (data.cycleData) {
        setCycleData({
          ...data.cycleData,
          lastPeriod: new Date(data.cycleData.lastPeriod),
          nextPeriod: new Date(data.cycleData.nextPeriod),
          ovulation: new Date(data.cycleData.ovulation),
        })
      }

      if (data.symptoms) {
        setSymptoms(data.symptoms.map((s) => ({ ...s, date: s.date ? new Date(s.date) : new Date() })))
      }

      if (data.moods) {
        setMoods(data.moods.map((m) => ({ ...m, date: m.date ? new Date(m.date) : new Date() })))
      }

      if (data.waterIntake) {
        setWaterIntake(data.waterIntake.map((w) => ({ ...w, date: w.date ? new Date(w.date) : new Date() })))
      }

      if (data.sleepData) {
        setSleepData(data.sleepData.map((s) => ({ ...s, date: s.date ? new Date(s.date) : new Date() })))
      }

      if (data.weightData) {
        setWeightData(data.weightData.map((w) => ({ ...w, date: w.date ? new Date(w.date) : new Date() })))
      }

      if (data.exerciseData) {
        setExerciseData(data.exerciseData.map((e) => ({ ...e, date: e.date ? new Date(e.date) : new Date() })))
      }

      if (data.medications) {
        setMedications(data.medications)
      }

      if (data.temperatureData) {
        setTemperatureData(data.temperatureData.map((t) => ({ ...t, date: t.date ? new Date(t.date) : new Date() })))
      }

      if (data.journalEntries) {
        setJournalEntries(data.journalEntries.map((j) => ({ ...j, date: j.date ? new Date(j.date) : new Date() })))
      }

      if (data.customSymptomsList) {
        setCustomSymptomsList(data.customSymptomsList)
      }

      if (data.settings) {
        setSettings(data.settings)
      }

      if (data.dailyWaterGoal) {
        setDailyWaterGoal(data.dailyWaterGoal)
      }

      if (data.waterGlassSize) {
        setWaterGlassSize(data.waterGlassSize)
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      
      if (error.message === "AUTHENTICATION_REQUIRED") {
        setAuthError("Please log in to access your health data");
      } else {
        toast.error(`Failed to load saved data: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }

  loadData()
}, [])

  // --- Save data to MongoDB whenever state changes ---
 // --- Save data to MongoDB whenever state changes ---
useEffect(() => {
  if (isLoading || authError) return // Don't save during initial load or if auth error

  console.log("Data changed, scheduling save...");
  
  const saveData = async () => {
    try {
      setIsSaving(true)
      const allData = {
        cycleData,
        symptoms,
        moods,
        waterIntake,
        sleepData,
        weightData,
        exerciseData,
        medications,
        temperatureData,
        journalEntries,
        customSymptomsList,
        settings,
        dailyWaterGoal,
        waterGlassSize,
        lastUpdated: new Date().toISOString(),
      }

      console.log("Attempting to save data...");
      await saveHealthData(allData)
      console.log("Data saved successfully");
    } catch (error) {
      console.error("Failed to save data:", error)
      
      if (error.message === "AUTHENTICATION_REQUIRED") {
        setAuthError("Session expired. Please log in again.");
      } else {
        toast.error(`Failed to save data: ${error.message}`);
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Debounce saves to avoid too many API calls
  const timeoutId = setTimeout(saveData, 2000)
  return () => clearTimeout(timeoutId)
}, [
  cycleData,
  symptoms,
  moods,
  waterIntake,
  sleepData,
  weightData,
  exerciseData,
  medications,
  temperatureData,
  journalEntries,
  customSymptomsList,
  settings,
  dailyWaterGoal,
  waterGlassSize,
  isLoading,
  authError,
])

  // Update cycle calculations
  useEffect(() => {
    updateCycleCalculations()
  }, [cycleData.lastPeriod, cycleData.cycleLength])

  // Update cycle calculations
  const updateCycleCalculations = () => {
    const today = new Date()
    const lastPeriod = new Date(cycleData.lastPeriod)
    const cycleLength = cycleData.cycleLength

    const daysDiff = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24))
    const currentDay = (daysDiff % cycleLength) + 1

    const nextPeriod = new Date(lastPeriod)
    nextPeriod.setDate(lastPeriod.getDate() + cycleLength)

    const ovulation = new Date(nextPeriod)
    ovulation.setDate(nextPeriod.getDate() - cycleData.lutealPhaseLength)

    let currentPhase = "Follicular"
    if (currentDay <= cycleData.periodLength) {
      currentPhase = "Menstrual"
    } else if (
      currentDay >= cycleLength - cycleData.lutealPhaseLength &&
      currentDay <= cycleLength - cycleData.lutealPhaseLength + 2
    ) {
      currentPhase = "Ovulation"
    } else if (currentDay > cycleLength - cycleData.lutealPhaseLength + 2) {
      currentPhase = "Luteal"
    }

    setCycleData((prev) => ({
      ...prev,
      currentDay,
      currentPhase,
      nextPeriod,
      ovulation,
    }))
  }

  // Mood tracking functions
  const logMood = () => {
    const moodToLog = {
      ...dailyMood,
      id: Date.now(),
      date: date,
    }
    setMoods((prev) => [moodToLog, ...prev])
    toast.success("Mood logged successfully!")

    // Reset form
    setDailyMood({
      mood: "neutral",
      energy: 5,
      stress: 3,
      anxiety: 2,
      notes: "",
      date: new Date(),
    })
  }

  // Water intake functions
  const addWater = (amount = waterGlassSize) => {
    const today = new Date().toDateString()
    const existingEntry = waterIntake.find((entry) => new Date(entry.date).toDateString() === today)

    if (existingEntry) {
      setWaterIntake((prev) =>
        prev.map((entry) => (entry.id === existingEntry.id ? { ...entry, amount: entry.amount + amount } : entry)),
      )
    } else {
      const newEntry = {
        id: Date.now(),
        amount,
        date: new Date(),
        goal: dailyWaterGoal,
      }
      setWaterIntake((prev) => [newEntry, ...prev])
    }
    toast.success(`Added ${amount}ml of water!`)
  }

  const getTodayWaterIntake = () => {
    const today = new Date().toDateString()
    const todayEntry = waterIntake.find((entry) => new Date(entry.date).toDateString() === today)
    return todayEntry ? todayEntry.amount : 0
  }

  // Sleep tracking functions
  const logSleep = () => {
    const sleepToLog = {
      ...sleepEntry,
      id: Date.now(),
      date: date,
      duration: calculateSleepDuration(sleepEntry.bedtime, sleepEntry.wakeTime),
    }
    setSleepData((prev) => [sleepToLog, ...prev])
    toast.success("Sleep data logged!")

    setSleepEntry({
      bedtime: "22:00",
      wakeTime: "07:00",
      quality: 7,
      notes: "",
      date: new Date(),
    })
  }

  const calculateSleepDuration = (bedtime, wakeTime) => {
    const bed = new Date(`2000-01-01 ${bedtime}`)
    const wake = new Date(`2000-01-01 ${wakeTime}`)

    if (wake < bed) {
      wake.setDate(wake.getDate() + 1)
    }

    const diff = wake - bed
    return Math.round((diff / (1000 * 60 * 60)) * 10) / 10 // hours with 1 decimal
  }

  // Weight tracking functions
  const logWeight = () => {
    if (!weightEntry.weight) {
      toast.error("Please enter your weight")
      return
    }

    const weightToLog = {
      ...weightEntry,
      id: Date.now(),
      weight: Number.parseFloat(weightEntry.weight),
      date: date,
    }
    setWeightData((prev) => [weightToLog, ...prev])
    toast.success("Weight logged successfully!")

    setWeightEntry({
      weight: "",
      unit: "kg",
      date: new Date(),
    })
  }

  // Exercise tracking functions
  const logExercise = () => {
    if (!exerciseEntry.duration) {
      toast.error("Please enter exercise duration")
      return
    }

    const exerciseToLog = {
      ...exerciseEntry,
      id: Date.now(),
      duration: Number.parseInt(exerciseEntry.duration),
      calories: exerciseEntry.calories ? Number.parseInt(exerciseEntry.calories) : null,
      date: date,
    }
    setExerciseData((prev) => [exerciseToLog, ...prev])
    toast.success("Exercise logged successfully!")

    setExerciseEntry({
      type: "cardio",
      duration: "",
      intensity: "moderate",
      calories: "",
      notes: "",
      date: new Date(),
    })
  }

  // Temperature tracking functions
  const logTemperature = () => {
    if (!temperatureEntry.temperature) {
      toast.error("Please enter temperature")
      return
    }

    const tempToLog = {
      ...temperatureEntry,
      id: Date.now(),
      temperature: Number.parseFloat(temperatureEntry.temperature),
      date: date,
    }
    setTemperatureData((prev) => [tempToLog, ...prev])
    toast.success("Temperature logged successfully!")

    setTemperatureEntry({
      temperature: "",
      time: "06:00",
      date: new Date(),
    })
  }

  // Journal functions
  const saveJournalEntry = () => {
    if (!journalEntry.content.trim()) {
      toast.error("Please write something in your journal")
      return
    }

    const entryToSave = {
      ...journalEntry,
      id: Date.now(),
      date: date,
    }
    setJournalEntries((prev) => [entryToSave, ...prev])
    toast.success("Journal entry saved!")

    setJournalEntry({
      title: "",
      content: "",
      mood: "neutral",
      date: new Date(),
    })
  }

  // Medication functions
  const addMedication = () => {
    if (!medicationEntry.name.trim()) {
      toast.error("Please enter medication name")
      return
    }

    const medToAdd = {
      ...medicationEntry,
      id: Date.now(),
      active: true,
    }
    setMedications((prev) => [medToAdd, ...prev])
    toast.success("Medication added!")

    setMedicationEntry({
      name: "",
      dosage: "",
      frequency: "daily",
      time: "08:00",
      notes: "",
    })
  }

  // Symptom functions (enhanced)
  const handleLogSymptom = () => {
    if (!newSymptom.type) {
      toast.error("Please select a symptom type")
      return
    }

    const symptomToLog = {
      ...newSymptom,
      id: Date.now(),
      date: date,
    }
    setSymptoms((prev) => [symptomToLog, ...prev])
    toast.success("Symptom logged successfully!")

    setNewSymptom({
      category: "physical",
      type: "",
      intensity: "moderate",
      date: new Date(),
      notes: "",
    })
  }

  // Custom symptom functions
  const handleAddCustomSymptom = () => {
    const trimmedSymptom = customSymptom.trim()
    if (trimmedSymptom && !customSymptomsList.includes(trimmedSymptom)) {
      setCustomSymptomsList((prev) => [...prev, trimmedSymptom])
      setCustomSymptom("")
      toast.success("Custom symptom added!")
      if (customSymptomInputRef.current) {
        customSymptomInputRef.current.focus()
      }
    }
  }

  // Data export functions
  const exportData = () => {
    const allData = {
      cycleData,
      symptoms,
      moods,
      waterIntake,
      sleepData,
      weightData,
      exerciseData,
      medications,
      temperatureData,
      journalEntries,
      customSymptomsList,
      settings,
      dailyWaterGoal,
      waterGlassSize,
      exportDate: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(allData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `health-tracker-backup-${new Date().toISOString().split("T")[0]}.json`
    link.click()

    URL.revokeObjectURL(url)
    toast.success("Data exported successfully!")
  }

  const importData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)

        // Validate and import data with date parsing
        if (importedData.cycleData) {
          setCycleData({
            ...importedData.cycleData,
            lastPeriod: new Date(importedData.cycleData.lastPeriod),
            nextPeriod: new Date(importedData.cycleData.nextPeriod),
            ovulation: new Date(importedData.cycleData.ovulation),
          })
        }
        if (importedData.symptoms) {
          setSymptoms(importedData.symptoms.map((s) => ({ ...s, date: new Date(s.date) })))
        }
        if (importedData.moods) {
          setMoods(importedData.moods.map((m) => ({ ...m, date: new Date(m.date) })))
        }
        if (importedData.waterIntake) {
          setWaterIntake(importedData.waterIntake.map((w) => ({ ...w, date: new Date(w.date) })))
        }
        if (importedData.sleepData) {
          setSleepData(importedData.sleepData.map((s) => ({ ...s, date: new Date(s.date) })))
        }
        if (importedData.weightData) {
          setWeightData(importedData.weightData.map((w) => ({ ...w, date: new Date(w.date) })))
        }
        if (importedData.exerciseData) {
          setExerciseData(importedData.exerciseData.map((e) => ({ ...e, date: new Date(e.date) })))
        }
        if (importedData.medications) setMedications(importedData.medications)
        if (importedData.temperatureData) {
          setTemperatureData(importedData.temperatureData.map((t) => ({ ...t, date: new Date(t.date) })))
        }
        if (importedData.journalEntries) {
          setJournalEntries(importedData.journalEntries.map((j) => ({ ...j, date: new Date(j.date) })))
        }
        if (importedData.customSymptomsList) setCustomSymptomsList(importedData.customSymptomsList)
        if (importedData.settings) setSettings(importedData.settings)
        if (importedData.dailyWaterGoal) setDailyWaterGoal(importedData.dailyWaterGoal)
        if (importedData.waterGlassSize) setWaterGlassSize(importedData.waterGlassSize)

        toast.success("Data imported successfully!")
      } catch (error) {
        toast.error("Failed to import data. Please check the file format.")
      }
    }
    reader.readAsText(file)
  }

  // Utility functions
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const daysUntilNextPeriod = () => {
    const today = new Date()
    const nextPeriod = new Date(cycleData.nextPeriod)
    const diffTime = nextPeriod.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      "very-happy": "😄",
      happy: "😊",
      neutral: "😐",
      sad: "😢",
      "very-sad": "😭",
      angry: "😠",
      anxious: "😰",
      excited: "🤩",
    }
    return moodEmojis[mood] || "😐"
  }

  const getCalendarModifiers = () => {
    const periodStart = new Date(cycleData.lastPeriod)
    const periodEnd = new Date(periodStart)
    periodEnd.setDate(periodStart.getDate() + cycleData.periodLength)

    const ovulationDate = new Date(cycleData.ovulation)
    const fertileStart = new Date(ovulationDate)
    fertileStart.setDate(ovulationDate.getDate() - 5)

    return {
      period: (day) => {
        const dayTime = day.getTime()
        return dayTime >= periodStart.getTime() && dayTime <= periodEnd.getTime()
      },
      ovulation: (day) => {
        return day.getTime() === ovulationDate.getTime()
      },
      fertile: (day) => {
        const dayTime = day.getTime()
        return dayTime >= fertileStart.getTime() && dayTime <= ovulationDate.getTime()
      },
    }
  }

  const predefinedSymptoms = {
    physical: ["Cramps", "Headache", "Bloating", "Breast Tenderness", "Back Pain", "Nausea", "Acne", "Hot Flashes"],
    emotional: ["Mood Swings", "Irritability", "Anxiety", "Depression", "Crying Spells", "Anger", "Euphoria"],
    sleep: ["Insomnia", "Restless Sleep", "Oversleeping", "Night Sweats", "Vivid Dreams"],
    energy: ["Fatigue", "Low Energy", "Hyperactivity", "Restlessness", "Brain Fog"],
    digestive: ["Constipation", "Diarrhea", "Food Cravings", "Loss of Appetite", "Nausea", "Heartburn"],
  }

  const getSymptomOptions = () => {
    const categorySymptoms = predefinedSymptoms[newSymptom.category] || []
    return [...categorySymptoms, ...customSymptomsList]
  }

  // Analytics functions
  const getWeeklyMoodAverage = () => {
    const lastWeek = moods.filter((mood) => {
      const moodDate = new Date(mood.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return moodDate >= weekAgo
    })

    if (lastWeek.length === 0) return 0

    const moodValues = {
      "very-sad": 1,
      sad: 2,
      neutral: 3,
      happy: 4,
      "very-happy": 5,
      angry: 2,
      anxious: 2,
      excited: 4,
    }

    const total = lastWeek.reduce((sum, mood) => sum + (moodValues[mood.mood] || 3), 0)
    return Math.round((total / lastWeek.length) * 10) / 10
  }

  const getAverageWaterIntake = () => {
    const lastWeek = waterIntake.filter((entry) => {
      const entryDate = new Date(entry.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return entryDate >= weekAgo
    })

    if (lastWeek.length === 0) return 0
    const total = lastWeek.reduce((sum, entry) => sum + entry.amount, 0)
    return Math.round(total / lastWeek.length)
  }

  const getAverageSleepDuration = () => {
    const lastWeek = sleepData.filter((entry) => {
      const entryDate = new Date(entry.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return entryDate >= weekAgo
    })

    if (lastWeek.length === 0) return 0
    const total = lastWeek.reduce((sum, entry) => sum + entry.duration, 0)
    return Math.round((total / lastWeek.length) * 10) / 10
  }

 // Show loading state
if (isLoading) {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">Loading your health data...</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

// Show authentication error
if (authError) {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-4">{authError}</p>
              <Button onClick={() => window.location.href = '/login'}>
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <Toaster position="top-right" />

        {/* Save indicator */}
        {isSaving && (
          <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-3 py-1 rounded-md text-sm">Saving...</div>
        )}

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Complete Wellness Tracker
            </h1>
            <p className="text-xl text-muted-foreground">Your comprehensive health and wellness companion</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full max-w-4xl mx-auto grid grid-cols-4 md:grid-cols-8 mb-8 h-auto p-1">
              <TabsTrigger value="dashboard" className="flex flex-col items-center gap-1 p-2">
                <BarChart3Icon className="h-4 w-4" />
                <span className="text-xs">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="cycle" className="flex flex-col items-center gap-1 p-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-xs">Cycle</span>
              </TabsTrigger>
              <TabsTrigger value="symptoms" className="flex flex-col items-center gap-1 p-2">
                <HeartIcon className="h-4 w-4" />
                <span className="text-xs">Symptoms</span>
              </TabsTrigger>
              <TabsTrigger value="mood" className="flex flex-col items-center gap-1 p-2">
                <SmileIcon className="h-4 w-4" />
                <span className="text-xs">Mood</span>
              </TabsTrigger>
              <TabsTrigger value="wellness" className="flex flex-col items-center gap-1 p-2">
                <ZapIcon className="h-4 w-4" />
                <span className="text-xs">Wellness</span>
              </TabsTrigger>
              <TabsTrigger value="tracking" className="flex flex-col items-center gap-1 p-2">
                <ActivityIcon className="h-4 w-4" />
                <span className="text-xs">Tracking</span>
              </TabsTrigger>
              <TabsTrigger value="journal" className="flex flex-col items-center gap-1 p-2">
                <BookOpenIcon className="h-4 w-4" />
                <span className="text-xs">Journal</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex flex-col items-center gap-1 p-2">
                <SettingsIcon className="h-4 w-4" />
                <span className="text-xs">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Quick Stats Cards */}
                <Card className="bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-pink-700 dark:text-pink-300">Next Period</p>
                        <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">
                          {daysUntilNextPeriod()} days
                        </p>
                      </div>
                      <DropletIcon className="h-8 w-8 text-pink-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Water Today</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{getTodayWaterIntake()}ml</p>
                      </div>
                      <GlassWaterIcon className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Avg Sleep</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                          {getAverageSleepDuration()}h
                        </p>
                      </div>
                      <MoonIcon className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Mood Score</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {getWeeklyMoodAverage()}/5
                        </p>
                      </div>
                      <SmileIcon className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Today's Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Today's Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Cycle Day</span>
                        <Badge variant="outline">
                          {cycleData.currentDay} of {cycleData.cycleLength}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Current Phase</span>
                        <Badge>{cycleData.currentPhase}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Water Progress</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(getTodayWaterIntake() / dailyWaterGoal) * 100} className="w-20" />
                          <span className="text-sm">{Math.round((getTodayWaterIntake() / dailyWaterGoal) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUpIcon className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => addWater()}
                        className="flex flex-col items-center gap-2 h-auto py-4"
                        variant="outline"
                      >
                        <GlassWaterIcon className="h-6 w-6" />
                        <span>Add Water</span>
                      </Button>
                      <Button
                        onClick={() => setActiveTab("mood")}
                        className="flex flex-col items-center gap-2 h-auto py-4"
                        variant="outline"
                      >
                        <SmileIcon className="h-6 w-6" />
                        <span>Log Mood</span>
                      </Button>
                      <Button
                        onClick={() => setActiveTab("symptoms")}
                        className="flex flex-col items-center gap-2 h-auto py-4"
                        variant="outline"
                      >
                        <HeartIcon className="h-6 w-6" />
                        <span>Log Symptom</span>
                      </Button>
                      <Button
                        onClick={() => setActiveTab("journal")}
                        className="flex flex-col items-center gap-2 h-auto py-4"
                        variant="outline"
                      >
                        <BookOpenIcon className="h-6 w-6" />
                        <span>Write Journal</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Recent symptoms */}
                    {symptoms.slice(0, 3).map((symptom) => (
                      <div key={symptom.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <HeartIcon className="h-4 w-4 text-red-500" />
                          <span className="capitalize">{symptom.type.replace("-", " ")}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(symptom.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}

                    {/* Recent moods */}
                    {moods.slice(0, 2).map((mood) => (
                      <div key={mood.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getMoodEmoji(mood.mood)}</span>
                          <span className="capitalize">{mood.mood.replace("-", " ")}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(mood.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}

                    {symptoms.length === 0 && moods.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No recent activity. Start tracking to see your data here!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cycle Tracker Tab */}
            <TabsContent value="cycle" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Calendar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => newDate && setDate(newDate)}
                      className="rounded-md border"
                      modifiers={getCalendarModifiers()}
                      modifiersClassNames={{
                        period: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100",
                        ovulation: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
                        fertile: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
                      }}
                    />

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                        <span>Period</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                        <span>Fertile Window</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                        <span>Ovulation</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <Button
                        className="w-full"
                        onClick={() => {
                          const newStartDate = new Date(date)
                          const newOvulation = new Date(newStartDate)
                          newOvulation.setDate(newStartDate.getDate() + 14)
                          const newNextPeriod = new Date(newStartDate)
                          newNextPeriod.setDate(newStartDate.getDate() + cycleData.cycleLength)

                          setCycleData((prev) => ({
                            ...prev,
                            lastPeriod: newStartDate,
                            ovulation: newOvulation,
                            nextPeriod: newNextPeriod,
                            currentPhase: "Menstrual",
                            currentDay: 1,
                          }))
                          toast.success("Period logged successfully!")
                        }}
                      >
                        <DropletIcon className="mr-2 h-4 w-4" />
                        Log Period Start
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => {
                          setTemperatureEntry((prev) => ({ ...prev, date }))
                          setActiveTab("tracking")
                        }}
                      >
                        <ThermometerIcon className="mr-2 h-4 w-4" />
                        Log Temperature
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Cycle Overview & Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">Current Phase</div>
                          <CalendarIcon className="h-4 w-4 text-pink-600" />
                        </div>
                        <div className="text-2xl font-semibold mb-1">{cycleData.currentPhase}</div>
                        <div className="text-sm text-muted-foreground">
                          Day {cycleData.currentDay} of {cycleData.cycleLength}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">Next Period</div>
                          <DropletIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-2xl font-semibold mb-1">In {daysUntilNextPeriod()} days</div>
                        <div className="text-sm text-muted-foreground">{formatDate(cycleData.nextPeriod)}</div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">Ovulation</div>
                          <ThermometerIcon className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="text-2xl font-semibold mb-1">{formatDate(cycleData.ovulation)}</div>
                        <div className="text-sm text-muted-foreground">Estimated</div>
                      </div>
                    </div>

                    {/* Cycle Settings */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                      <h3 className="font-medium mb-4">Cycle Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="cycle-length">Cycle Length (days)</Label>
                          <Input
                            id="cycle-length"
                            type="number"
                            min={21}
                            max={35}
                            value={cycleData.cycleLength}
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value)
                              if (value >= 21 && value <= 35) {
                                setCycleData((prev) => ({ ...prev, cycleLength: value }))
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor="period-length">Period Length (days)</Label>
                          <Input
                            id="period-length"
                            type="number"
                            min={3}
                            max={8}
                            value={cycleData.periodLength}
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value)
                              if (value >= 3 && value <= 8) {
                                setCycleData((prev) => ({ ...prev, periodLength: value }))
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor="luteal-length">Luteal Phase (days)</Label>
                          <Input
                            id="luteal-length"
                            type="number"
                            min={10}
                            max={16}
                            value={cycleData.lutealPhaseLength}
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value)
                              if (value >= 10 && value <= 16) {
                                setCycleData((prev) => ({ ...prev, lutealPhaseLength: value }))
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cycle Timeline */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mt-6">
                      <h3 className="font-medium mb-4">Cycle Prediction Timeline</h3>
                      <div className="relative">
                        <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-muted"></div>

                        <div className="relative pl-10 pb-6">
                          <div className="absolute left-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white">
                            <DropletIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">Last Period</h4>
                            <p className="text-sm text-muted-foreground">{formatDate(cycleData.lastPeriod)}</p>
                          </div>
                        </div>

                        <div className="relative pl-10 pb-6">
                          <div className="absolute left-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            <ThermometerIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">Ovulation</h4>
                            <p className="text-sm text-muted-foreground">{formatDate(cycleData.ovulation)}</p>
                          </div>
                        </div>

                        <div className="relative pl-10">
                          <div className="absolute left-0 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white">
                            <DropletIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">Next Period</h4>
                            <p className="text-sm text-muted-foreground">{formatDate(cycleData.nextPeriod)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Symptoms Tab */}
            <TabsContent value="symptoms" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PlusIcon className="h-5 w-5" />
                        Log Symptoms
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label>Date</Label>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-transparent"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>{date.toLocaleDateString()}</span>
                          </Button>
                        </div>

                        <div>
                          <Label>Category</Label>
                          <Select
                            value={newSymptom.category}
                            onValueChange={(value) => setNewSymptom((prev) => ({ ...prev, category: value, type: "" }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="physical">Physical</SelectItem>
                              <SelectItem value="emotional">Emotional</SelectItem>
                              <SelectItem value="sleep">Sleep</SelectItem>
                              <SelectItem value="energy">Energy</SelectItem>
                              <SelectItem value="digestive">Digestive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Symptom</Label>
                          <Select
                            value={newSymptom.type}
                            onValueChange={(value) => setNewSymptom((prev) => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select symptom" />
                            </SelectTrigger>
                            <SelectContent>
                              {getSymptomOptions().map((symptom) => (
                                <SelectItem key={symptom} value={symptom.toLowerCase().replace(/\s+/g, "-")}>
                                  {symptom}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="flex mt-2 gap-2">
                            <Input
                              ref={customSymptomInputRef}
                              value={customSymptom}
                              onChange={(e) => setCustomSymptom(e.target.value)}
                              placeholder="Add custom symptom"
                              onKeyDown={(e) => e.key === "Enter" && handleAddCustomSymptom()}
                            />
                            <Button size="sm" onClick={handleAddCustomSymptom} disabled={!customSymptom.trim()}>
                              Add
                            </Button>
                          </div>

                          {customSymptomsList.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {customSymptomsList.map((symptom) => (
                                <Badge key={symptom} variant="secondary" className="flex items-center gap-1">
                                  {symptom}
                                  <button
                                    onClick={() => setCustomSymptomsList((prev) => prev.filter((s) => s !== symptom))}
                                    className="ml-1 hover:text-red-500"
                                  >
                                    <XIcon className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label>Intensity</Label>
                          <Select
                            value={newSymptom.intensity}
                            onValueChange={(value) => setNewSymptom((prev) => ({ ...prev, intensity: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mild">Mild</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="severe">Severe</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Notes (optional)</Label>
                          <Textarea
                            value={newSymptom.notes}
                            onChange={(e) => setNewSymptom((prev) => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional details..."
                            rows={3}
                          />
                        </div>

                        <Button className="w-full" onClick={handleLogSymptom} disabled={!newSymptom.type}>
                          Log Symptom
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Symptom History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {symptoms.length > 0 ? (
                          symptoms.map((symptom) => (
                            <div key={symptom.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium capitalize">{symptom.type.replace("-", " ")}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant={
                                        symptom.intensity === "severe"
                                          ? "destructive"
                                          : symptom.intensity === "moderate"
                                            ? "default"
                                            : "secondary"
                                      }
                                    >
                                      {symptom.intensity}
                                    </Badge>
                                    <Badge variant="outline">{symptom.category}</Badge>
                                  </div>
                                  {symptom.notes && (
                                    <p className="text-sm text-muted-foreground mt-2">{symptom.notes}</p>
                                  )}
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {new Date(symptom.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setSymptoms((prev) => prev.filter((s) => s.id !== symptom.id))
                                    toast.info("Symptom deleted")
                                  }}
                                >
                                  <Trash2Icon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-8">
                            <HeartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <div className="text-muted-foreground mb-2">No symptoms logged yet</div>
                            <p className="text-sm text-muted-foreground">
                              Start tracking your symptoms to identify patterns
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Mood Tab */}
            <TabsContent value="mood" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <SmileIcon className="h-5 w-5" />
                        Log Mood
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label>Date</Label>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-transparent"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>{date.toLocaleDateString()}</span>
                          </Button>
                        </div>

                        <div>
                          <Label>Overall Mood</Label>
                          <Select
                            value={dailyMood.mood}
                            onValueChange={(value) => setDailyMood((prev) => ({ ...prev, mood: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="very-happy">😄 Very Happy</SelectItem>
                              <SelectItem value="happy">😊 Happy</SelectItem>
                              <SelectItem value="neutral">😐 Neutral</SelectItem>
                              <SelectItem value="sad">😢 Sad</SelectItem>
                              <SelectItem value="very-sad">😭 Very Sad</SelectItem>
                              <SelectItem value="angry">😠 Angry</SelectItem>
                              <SelectItem value="anxious">😰 Anxious</SelectItem>
                              <SelectItem value="excited">🤩 Excited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Energy Level: {dailyMood.energy}/10</Label>
                          <Slider
                            value={[dailyMood.energy]}
                            onValueChange={(value) => setDailyMood((prev) => ({ ...prev, energy: value[0] }))}
                            max={10}
                            min={1}
                            step={1}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Stress Level: {dailyMood.stress}/10</Label>
                          <Slider
                            value={[dailyMood.stress]}
                            onValueChange={(value) => setDailyMood((prev) => ({ ...prev, stress: value[0] }))}
                            max={10}
                            min={1}
                            step={1}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Anxiety Level: {dailyMood.anxiety}/10</Label>
                          <Slider
                            value={[dailyMood.anxiety]}
                            onValueChange={(value) => setDailyMood((prev) => ({ ...prev, anxiety: value[0] }))}
                            max={10}
                            min={1}
                            step={1}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Notes (optional)</Label>
                          <Textarea
                            value={dailyMood.notes}
                            onChange={(e) => setDailyMood((prev) => ({ ...prev, notes: e.target.value }))}
                            placeholder="How are you feeling today?"
                            rows={3}
                          />
                        </div>

                        <Button className="w-full" onClick={logMood}>
                          Log Mood
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mood History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {moods.length > 0 ? (
                          moods.map((mood) => (
                            <div key={mood.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">{getMoodEmoji(mood.mood)}</span>
                                    <div>
                                      <h4 className="font-medium capitalize">{mood.mood.replace("-", " ")}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(mood.date).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-4 mb-2">
                                    <div className="text-center">
                                      <p className="text-xs text-muted-foreground">Energy</p>
                                      <p className="font-semibold">{mood.energy}/10</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs text-muted-foreground">Stress</p>
                                      <p className="font-semibold">{mood.stress}/10</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs text-muted-foreground">Anxiety</p>
                                      <p className="font-semibold">{mood.anxiety}/10</p>
                                    </div>
                                  </div>

                                  {mood.notes && <p className="text-sm text-muted-foreground mt-2">{mood.notes}</p>}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setMoods((prev) => prev.filter((m) => m.id !== mood.id))
                                    toast.info("Mood entry deleted")
                                  }}
                                >
                                  <Trash2Icon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-8">
                            <SmileIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <div className="text-muted-foreground mb-2">No mood entries yet</div>
                            <p className="text-sm text-muted-foreground">
                              Start tracking your mood to see patterns over time
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Wellness Tab */}
            <TabsContent value="wellness" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Water Intake */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GlassWaterIcon className="h-5 w-5" />
                      Water Intake
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{getTodayWaterIntake()}ml</div>
                        <div className="text-sm text-muted-foreground">of {dailyWaterGoal}ml goal</div>
                        <Progress value={(getTodayWaterIntake() / dailyWaterGoal) * 100} className="mt-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={() => addWater(250)} variant="outline">
                          +250ml
                        </Button>
                        <Button onClick={() => addWater(500)} variant="outline">
                          +500ml
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Custom amount"
                          value={waterGlassSize}
                          onChange={(e) => setWaterGlassSize(Number(e.target.value) || 250)}
                        />
                        <Button onClick={() => addWater(waterGlassSize)}>Add</Button>
                      </div>

                      <div>
                        <Label>Daily Goal (ml)</Label>
                        <Input
                          type="number"
                          value={dailyWaterGoal}
                          onChange={(e) => setDailyWaterGoal(Number(e.target.value) || 2000)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sleep Tracking */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MoonIcon className="h-5 w-5" />
                      Sleep Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Bedtime</Label>
                        <Input
                          type="time"
                          value={sleepEntry.bedtime}
                          onChange={(e) => setSleepEntry((prev) => ({ ...prev, bedtime: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label>Wake Time</Label>
                        <Input
                          type="time"
                          value={sleepEntry.wakeTime}
                          onChange={(e) => setSleepEntry((prev) => ({ ...prev, wakeTime: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label>Sleep Quality: {sleepEntry.quality}/10</Label>
                        <Slider
                          value={[sleepEntry.quality]}
                          onValueChange={(value) => setSleepEntry((prev) => ({ ...prev, quality: value[0] }))}
                          max={10}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          value={sleepEntry.notes}
                          onChange={(e) => setSleepEntry((prev) => ({ ...prev, notes: e.target.value }))}
                          placeholder="How did you sleep?"
                          rows={2}
                        />
                      </div>

                      <Button className="w-full" onClick={logSleep}>
                        Log Sleep
                      </Button>

                      {sleepData.length > 0 && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium">Recent Average</p>
                          <p className="text-lg font-semibold">{getAverageSleepDuration()}h per night</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Weight Tracking */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ActivityIcon className="h-5 w-5" />
                      Weight Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Weight"
                          value={weightEntry.weight}
                          onChange={(e) => setWeightEntry((prev) => ({ ...prev, weight: e.target.value }))}
                        />
                        <Select
                          value={weightEntry.unit}
                          onValueChange={(value) => setWeightEntry((prev) => ({ ...prev, unit: value }))}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="lbs">lbs</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button className="w-full" onClick={logWeight}>
                        Log Weight
                      </Button>

                      {weightData.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Recent Entries</p>
                          {weightData.slice(0, 3).map((entry) => (
                            <div key={entry.id} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                              <span>
                                {entry.weight} {entry.unit}
                              </span>
                              <span>{new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Exercise Tracking */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ZapIcon className="h-5 w-5" />
                      Exercise Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Exercise Type</Label>
                        <Select
                          value={exerciseEntry.type}
                          onValueChange={(value) => setExerciseEntry((prev) => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cardio">Cardio</SelectItem>
                            <SelectItem value="strength">Strength Training</SelectItem>
                            <SelectItem value="yoga">Yoga</SelectItem>
                            <SelectItem value="walking">Walking</SelectItem>
                            <SelectItem value="running">Running</SelectItem>
                            <SelectItem value="cycling">Cycling</SelectItem>
                            <SelectItem value="swimming">Swimming</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Duration (minutes)</Label>
                        <Input
                          type="number"
                          value={exerciseEntry.duration}
                          onChange={(e) => setExerciseEntry((prev) => ({ ...prev, duration: e.target.value }))}
                          placeholder="30"
                        />
                      </div>

                      <div>
                        <Label>Intensity</Label>
                        <Select
                          value={exerciseEntry.intensity}
                          onValueChange={(value) => setExerciseEntry((prev) => ({ ...prev, intensity: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="vigorous">Vigorous</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Calories (optional)</Label>
                        <Input
                          type="number"
                          value={exerciseEntry.calories}
                          onChange={(e) => setExerciseEntry((prev) => ({ ...prev, calories: e.target.value }))}
                          placeholder="200"
                        />
                      </div>

                      <Button className="w-full" onClick={logExercise}>
                        Log Exercise
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tracking Tab */}
            <TabsContent value="tracking" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Temperature Tracking */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ThermometerIcon className="h-5 w-5" />
                      Temperature Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Temperature (°C)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={temperatureEntry.temperature}
                          onChange={(e) => setTemperatureEntry((prev) => ({ ...prev, temperature: e.target.value }))}
                          placeholder="36.5"
                        />
                      </div>

                      <div>
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={temperatureEntry.time}
                          onChange={(e) => setTemperatureEntry((prev) => ({ ...prev, time: e.target.value }))}
                        />
                      </div>

                      <Button className="w-full" onClick={logTemperature}>
                        Log Temperature
                      </Button>

                      {temperatureData.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Recent Readings</p>
                          {temperatureData.slice(0, 5).map((entry) => (
                            <div key={entry.id} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                              <span>{entry.temperature}°C</span>
                              <span>{new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Medication Tracking */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PillIcon className="h-5 w-5" />
                      Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Medication Name</Label>
                        <Input
                          value={medicationEntry.name}
                          onChange={(e) => setMedicationEntry((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Medication name"
                        />
                      </div>

                      <div>
                        <Label>Dosage</Label>
                        <Input
                          value={medicationEntry.dosage}
                          onChange={(e) => setMedicationEntry((prev) => ({ ...prev, dosage: e.target.value }))}
                          placeholder="e.g., 10mg"
                        />
                      </div>

                      <div>
                        <Label>Frequency</Label>
                        <Select
                          value={medicationEntry.frequency}
                          onValueChange={(value) => setMedicationEntry((prev) => ({ ...prev, frequency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="twice-daily">Twice Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="as-needed">As Needed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={medicationEntry.time}
                          onChange={(e) => setMedicationEntry((prev) => ({ ...prev, time: e.target.value }))}
                        />
                      </div>

                      <Button className="w-full" onClick={addMedication}>
                        Add Medication
                      </Button>

                      {medications.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Active Medications</p>
                          {medications
                            .filter((med) => med.active)
                            .map((med) => (
                              <div key={med.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                <div>
                                  <p className="font-medium">{med.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {med.dosage} - {med.frequency}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setMedications((prev) =>
                                      prev.map((m) => (m.id === med.id ? { ...m, active: false } : m)),
                                    )
                                    toast.info("Medication deactivated")
                                  }}
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Journal Tab */}
            <TabsContent value="journal" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpenIcon className="h-5 w-5" />
                        Write Journal Entry
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label>Date</Label>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-transparent"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>{date.toLocaleDateString()}</span>
                          </Button>
                        </div>

                        <div>
                          <Label>Title (optional)</Label>
                          <Input
                            value={journalEntry.title}
                            onChange={(e) => setJournalEntry((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="Entry title..."
                          />
                        </div>

                        <div>
                          <Label>How are you feeling?</Label>
                          <Select
                            value={journalEntry.mood}
                            onValueChange={(value) => setJournalEntry((prev) => ({ ...prev, mood: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="very-happy">😄 Very Happy</SelectItem>
                              <SelectItem value="happy">😊 Happy</SelectItem>
                              <SelectItem value="neutral">😐 Neutral</SelectItem>
                              <SelectItem value="sad">😢 Sad</SelectItem>
                              <SelectItem value="anxious">😰 Anxious</SelectItem>
                              <SelectItem value="excited">🤩 Excited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Your thoughts...</Label>
                          <Textarea
                            value={journalEntry.content}
                            onChange={(e) => setJournalEntry((prev) => ({ ...prev, content: e.target.value }))}
                            placeholder="Write about your day, thoughts, feelings..."
                            rows={8}
                            className="resize-none"
                          />
                        </div>

                        <Button className="w-full" onClick={saveJournalEntry}>
                          Save Entry
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-7">
                  <Card>
                    <CardHeader>
                      <CardTitle>Journal Entries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {journalEntries.length > 0 ? (
                          journalEntries.map((entry) => (
                            <div key={entry.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                                  <div>
                                    {entry.title && <h4 className="font-medium">{entry.title}</h4>}
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(entry.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setJournalEntries((prev) => prev.filter((j) => j.id !== entry.id))
                                    toast.info("Journal entry deleted")
                                  }}
                                >
                                  <Trash2Icon className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-8">
                            <BookOpenIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <div className="text-muted-foreground mb-2">No journal entries yet</div>
                            <p className="text-sm text-muted-foreground">
                              Start writing to track your thoughts and feelings
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SettingsIcon className="h-5 w-5" />
                      App Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notifications</Label>
                          <p className="text-sm text-muted-foreground">Enable reminder notifications</p>
                        </div>
                        <Switch
                          checked={settings.notifications}
                          onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, notifications: checked }))}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>Reminder Times</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm">Water Reminder</Label>
                            <Input
                              type="time"
                              value={settings.reminderTimes.water}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  reminderTimes: { ...prev.reminderTimes, water: e.target.value },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Medication Reminder</Label>
                            <Input
                              type="time"
                              value={settings.reminderTimes.medication}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  reminderTimes: { ...prev.reminderTimes, medication: e.target.value },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Sleep Reminder</Label>
                            <Input
                              type="time"
                              value={settings.reminderTimes.sleep}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  reminderTimes: { ...prev.reminderTimes, sleep: e.target.value },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Mood Check-in</Label>
                            <Input
                              type="time"
                              value={settings.reminderTimes.mood}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  reminderTimes: { ...prev.reminderTimes, mood: e.target.value },
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>Units</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm">Weight</Label>
                            <Select
                              value={settings.units.weight}
                              onValueChange={(value) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  units: { ...prev.units, weight: value },
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm">Temperature</Label>
                            <Select
                              value={settings.units.temperature}
                              onValueChange={(value) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  units: { ...prev.units, temperature: value },
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="celsius">Celsius (°C)</SelectItem>
                                <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DownloadIcon className="h-5 w-5" />
                      Data Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Export Data</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Download all your health data as a JSON file
                        </p>
                        <Button onClick={exportData} className="w-full bg-transparent" variant="outline">
                          <DownloadIcon className="mr-2 h-4 w-4" />
                          Export All Data
                        </Button>
                      </div>

                      <div>
                        <Label>Import Data</Label>
                        <p className="text-sm text-muted-foreground mb-2">Import previously exported data</p>
                        <div className="flex items-center gap-2">
                          <Input type="file" accept=".json" onChange={importData} className="flex-1" />
                          <Button variant="outline">
                            <UploadIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Label>Clear All Data</Label>
                        <p className="text-sm text-muted-foreground mb-2">This will permanently delete all your data</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" className="w-full">
                              Clear All Data
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Are you sure?</DialogTitle>
                            </DialogHeader>
                            <p className="text-sm text-muted-foreground">
                              This action cannot be undone. All your health tracking data will be permanently deleted.
                            </p>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline">Cancel</Button>
                              <Button
                                variant="destructive"
                                onClick={async () => {
                                  try {
                                    // Clear MongoDB data
                                    await fetch(API_URL, { method: "DELETE" })
                                    // Clear local state
                                    window.location.reload()
                                  } catch (error) {
                                    toast.error("Failed to clear data")
                                  }
                                }}
                              >
                                Delete Everything
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}
