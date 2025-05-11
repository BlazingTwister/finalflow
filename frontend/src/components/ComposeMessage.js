// components/ComposeMessage.js
import React, { useState } from 'react';
import { sendMessage } from '../api/api';

const ComposeMessage = () => {
    const [recipientId, setRecipientId] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await sendMessage({ recipient_id: recipientId, subject, body });
            setSuccess("Message sent!");
            setRecipientId('');
            setSubject('');
            setBody('');
        } catch (err) {
            setError("Failed to send message.");
        }
    };

    return (
        <div>
            <h2>Compose Message</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Recipient ID"
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Message"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                />
                <button type="submit">Send</button>
            </form>
            {success && <p style={{ color: 'green' }}>{success}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ComposeMessage;
