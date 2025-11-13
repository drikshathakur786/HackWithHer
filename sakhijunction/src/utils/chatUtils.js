import { companyInfo } from "../components/companyInfo"

// Function to check if a message is asking about company information
export const isCompanyInfoQuery = (message) => {
  const companyKeywords = [
    "sakhi",
    "सखी",
    "junction",
    "about",
    "company",
    "mission",
    "features",
    "what is",
    "tell me about",
    "who are you",
    "what do you do",
    "help",
    "services",
    "platform",
    "app",
    "application",
    "privacy",
    "security",
    "community",
    "values",
    "philosophy",
    "resources",
    "support",
  ]

  const lowercaseMessage = message.toLowerCase()

  // Increase the threshold for company info detection
  const matchedKeywords = companyKeywords.filter(keyword => 
    lowercaseMessage.includes(keyword.toLowerCase())
  )

  // Only return true if multiple keywords are matched or the match is very specific
  return (
    matchedKeywords.length > 1 || 
    (matchedKeywords.length === 1 && 
      (lowercaseMessage.includes("about") || 
       lowercaseMessage.includes("what is") || 
       lowercaseMessage.includes("tell me about")))
  )
}

// Function to generate a response based on company information
export const generateCompanyResponse = (message) => {
  const lowercaseMessage = message.toLowerCase()

  // Check for specific queries and return relevant information
  const sectionMappings = [
    { keywords: ["feature", "what can you do"], section: "Key Features" },
    { keywords: ["mission", "purpose"], section: "Platform Mission" },
    { keywords: ["about", "what is", "tell me about", "who are you"], section: "About सखी Junction" },
    { keywords: ["privacy", "security", "tech"], section: "Tech & Privacy" },
    { keywords: ["philosophy", "belief"], section: "Our Philosophy" },
    { keywords: ["values", "community values"], section: "Community Values" },
    { keywords: ["resources", "support", "help"], section: "Additional Support Resources" }
  ]

  // Find the first matching section
  const matchedSection = sectionMappings.find(mapping => 
    mapping.keywords.some(keyword => lowercaseMessage.includes(keyword))
  )

  // If a specific section is found, extract and return it
  if (matchedSection) {
    return extractInfoSection(companyInfo, matchedSection.section)
  }

  // If no specific section matches, return a general introduction
  return extractInfoSection(companyInfo, "Introduction") + "\n\nIs there a specific aspect of our platform you'd like to know more about?"
}

// Helper function to extract specific sections from company info
const extractInfoSection = (info, sectionName) => {
  const sections = info.split("\n\n")

  for (let i = 0; i < sections.length; i++) {
    if (sections[i].includes(sectionName + ":")) {
      // Return this section and potentially the next few paragraphs
      let response = sections[i]

      // Add the next paragraph if it's part of the same section (doesn't contain another section name)
      if (i + 1 < sections.length && !sections[i + 1].includes(":")) {
        response += "\n\n" + sections[i + 1]
      }

      return response
    }
  }

  // If section not found, return a default message
  return "I'm your supportive सखी Junction assistant. How can I help you with women's health today?"
}