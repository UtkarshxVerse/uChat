import React, { useState } from "react";
import { createMessage } from "../Api/axios.js";
import { getSocket } from "../Services/socket.js";
import { getCurrentUserId } from "../Utils/jwtDecode";


export default function MessageInput({ conversation, setMessages }) {
    const [text, setText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async () => {
        try {
            if (!text.trim()) return;

            setIsLoading(true);
            const currentUserId = getCurrentUserId();
            const timestamp = new Date().toISOString();

            const messageData = {
                receiverId: conversation.id,
                message: text,
            };

            // Send message via API (save to database)
            const response = await createMessage(messageData);

            // Add the created message object into the UI proactively
            const savedMessage = {
                id: `${currentUserId}_${text}_${timestamp}`,
                sender_id: currentUserId,
                receiver_id: conversation.id,
                message: text,
                timestamp: timestamp,
            };

            setMessages((prev) => [...prev, savedMessage]);
            setText("");

            // Emit message via socket (for real-time delivery)
            const socket = getSocket();
            if (socket && socket.connected) {
                socket.emit("send_message", {
                    toUserId: conversation.id,
                    message: text,
                    timestamp: timestamp
                });
            }

        } catch (error) {
            console.error("Send message error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                padding: "20px",
                borderTop: "1px solid #333",
                background: "#111",
                gap: "10px"
            }}
        >
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
                style={{ flex: 1, padding: '10px', borderRadius: '5px', background: '#222', color: 'white', border: 'none', outline: 'none' }}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) sendMessage();
                }}
            />
            <button 
                onClick={sendMessage} 
                disabled={isLoading}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-md hover:scale-105 transition disabled:opacity-50"
            >
                {isLoading ? "..." : "Send"}
            </button>
        </div>
    );
}