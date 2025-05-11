import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Messages({ withUserId, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        fetchMessages();
    }, [withUserId]);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/messages/${withUserId}`, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSend = async () => {
        try {
            await axios.post("http://127.0.0.1:8000/api/messages", {
                receiver_id: withUserId,
                message: newMessage
            }, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            setNewMessage("");
            fetchMessages(); // Refresh messages
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="messages-container">
            <div className="chat-box">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={msg.sender_id === currentUser.id ? "sent" : "received"}
                    >
                        {msg.message}
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
}

export default Messages;
