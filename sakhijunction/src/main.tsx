import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Chatbot from './ChatBot.jsx'
import { SocketProvider } from './context/socketContext.jsx'

createRoot(document.getElementById('root')!).render(
  <SocketProvider>
    <StrictMode>
      <Chatbot />
      <App />
    </StrictMode>
  </SocketProvider>
)