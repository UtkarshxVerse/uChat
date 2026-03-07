import React, { useState } from "react";
import { createMessage } from "../Api/axios.js";
import { getSocket } from "../Services/socket.js";

export default function MessageInput({ conversation, setMessages }) {
    const [text, setText] = useState("");

    const sendMessage = async () => {
        try {
            if (!text.trim()) return;

            const messageData = {
                receiverId: conversation.id,
                message: text,
            };

            const response = await createMessage(messageData);

            // Add the created message object into the UI proactively
            const savedMessage = {
                id: Date.now(),
                sender_id: JSON.parse(localStorage.getItem('user'))?.id,
                receiver_id: conversation.id,
                message: text,
            };

            const socket = getSocket();
            if (socket) {
                socket.emit("send_message", savedMessage);
            }

            setMessages((prev) => [...prev, savedMessage]);
            setText("");

        } catch (error) {
            console.error("Send message error:", error);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                padding: "20px",
                borderTop: "1px solid #333",
                background: "#111"
            }}
        >
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ flex: 1, marginRight: "10px", padding: '10px', borderRadius: '5px', background: '#222', color: 'white', border: 'none', outline: 'none' }}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                    if (e.key === 'Enter') sendMessage();
                }}
            />
            <button onClick={sendMessage} className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-md hover:scale-105 transition">
                Send
            </button>
        </div>
    );
}