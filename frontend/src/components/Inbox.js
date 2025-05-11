// components/Inbox.js
import React, { useEffect, useState } from 'react';
import { fetchMessages, markMessageAsRead } from '../api/api';

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const data = await fetchMessages();
            setMessages(data);
        } catch (error) {
            console.error("Failed to load messages.");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markMessageAsRead(id);
            setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
        } catch (error) {
            console.error("Failed to mark message as read.");
        }
    };

    return (
        <div>
            <h2>Inbox</h2>
            {loading ? (
                <p>Loading messages...</p>
            ) : (
                <ul>
                    {messages.map((msg) => (
                        <li key={msg.id} style={{ fontWeight: msg.read ? 'normal' : 'bold' }}>
                            <strong>From:</strong> {msg.sender_name || msg.sender_id} <br />
                            <strong>Subject:</strong> {msg.subject} <br />
                            <strong>Message:</strong> {msg.body} <br />
                            <button onClick={() => handleMarkAsRead(msg.id)}>
                                {msg.read ? "Read" : "Mark as Read"}
                            </button>
                            <hr />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Inbox;
