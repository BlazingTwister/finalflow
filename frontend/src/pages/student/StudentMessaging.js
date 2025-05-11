import { useState } from "react";
import "../../styles/messaging.css";

function StudentMessaging() {
  const [messages, setMessages] = useState([
    { sender: "supervisor", text: "Hello, how is your capstone project going?" },
    { sender: "student", text: "It's going well! I have some questions about the requirements." }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return; // Prevent empty messages

    // Add new message to chat
    setMessages([...messages, { sender: "student", text: newMessage }]);
    setNewMessage(""); // Clear input
  };

  return (
    <div className="messaging-container">
      <h2>📩 Chat with Supervisor</h2>
      
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default StudentMessaging;
