import { useEffect, useRef, useState } from "react"
import ChatbotIcon from "./components/ChatbotIcon"
import ChatForm from "./components/ChatForm"
import ChatMessage from "./components/ChatMessage"
import { isCompanyInfoQuery, generateCompanyResponse } from "./utils/chatUtils"

const ChatBot = () => {
  const [chatHistory, setChatHistory] = useState([])
  const [showChatbot, setShowChatbot] = useState(false)
  const chatBodyRef = useRef(null)

  const generateBotResponse = async (history, newUserMessage) => {
    // First check if the message is asking about company information
    if (isCompanyInfoQuery(newUserMessage.message)) {
      const companyResponse = generateCompanyResponse(newUserMessage.message)

      // Update chat history with company info response
      setChatHistory((prevHistory) => {
        // Remove the "Thinking..." message
        const filteredHistory = prevHistory.filter((msg) => msg.message !== "Thinking...")

        // Add the company info response
        return [...filteredHistory, { role: "model", message: companyResponse }]
      })

      return // Exit the function early since we've handled the response
    }

    // If not a company info query, proceed with the API call
    // Prepare the request payload
    const contents = [
      ...history.map((chat) => ({
        role: chat.role === "user" ? "user" : "model",
        parts: [{ text: chat.message }],
      })),
      {
        role: "user",
        parts: [{ text: newUserMessage.message }],
      },
    ]

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: contents,
      }),
    }

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, requestOptions)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Something went wrong!")
      }

      // Extract the bot's response
      const botResponse = data.candidates[0].content.parts[0].text.replace(/\\*(.?)\*\*/g, "$1").trim()

      // Update chat history with bot's response
      setChatHistory((prevHistory) => {
        // Remove the "Thinking..." message
        const filteredHistory = prevHistory.filter((msg) => msg.message !== "Thinking...")

        // Add the actual bot response
        return [...filteredHistory, { role: "model", message: botResponse }]
      })
    } catch (error) {
      console.error("Error generating bot response:", error)

      // Update chat history with error message
      setChatHistory((prevHistory) => {
        const filteredHistory = prevHistory.filter((msg) => msg.message !== "Thinking...")
        return [...filteredHistory, { role: "model", message: "Sorry, something went wrong. Please try again." }]
      })
    }
  }

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [chatBodyRef]) //Corrected dependency

  return (
    <div className="container">
      <button id="chatbot-toggler" onClick={() => setShowChatbot((prev) => !prev)}>
        {showChatbot ? (
          <span className="material-symbols-rounded">close</span>
        ) : (
          <span className="material-symbols-rounded">mode_comment</span>
        )}
      </button>

      <div className={`chatbot-popup ${showChatbot ? "show" : ""}`}>
        {/* Chatbot Header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">सखी Junction Assistant</h2>
          </div>
          <button className="material-symbols-rounded" onClick={() => setShowChatbot(false)}>
            keyboard_arrow_down
          </button>
        </div>

        {/* Chatbot Body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              नमस्ते! 👋 I'm your सखी Junction assistant. I can help with information about our platform, women's health
              resources, or any other questions you might have. How can I support you today?
            </p>
          </div>

          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        {/* Chatbot Footer */}
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  )
}

export default ChatBot

