import React, { useRef } from "react";

const ChatForm = ({chatHistory, setChatHistory, generateBotResponse}) => {
    const inputRef = useRef(null);
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const userMessage = inputRef.current.value.trim();
        if(!userMessage) return;
        inputRef.current.value = ""; 

        // Add user message to chat history
        setChatHistory(history => [...history, {role: "user", message: userMessage}]);

        setTimeout(()=> {
          // Add "Thinking..." message
          setChatHistory((history) => [...history, {role: "model", message: "Thinking..."}]);

          // Generate bot response
          generateBotResponse(chatHistory, {role: "user", message: userMessage});
        },600);
    }

    return (
        <div>
            <form action="#" className="chat-form" onSubmit={handleFormSubmit}>
                <input type="text" placeholder="Message..." className="message-input" ref={inputRef} required/>
                <button className="material-symbols-rounded">arrow_upward</button>
            </form>
        </div>
    )
}

export default ChatForm