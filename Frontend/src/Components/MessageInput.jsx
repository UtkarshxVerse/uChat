import React, { useState } from "react";
import { createMessage } from "../Api/axios.js";
import { getSocket } from "../Services/socket.js";
import { getCurrentUserId } from "../Utils/jwtDecode";
import { toast } from "react-toastify";


export default function MessageInput({ conversation, setMessages }) {
    const [text, setText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Handle text input - allow any text
    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    const sendMessage = async () => {
        try {
            if (!text.trim()) {
                toast.error("Invalid input: Message cannot be empty");
                return;
            }

            const firstChar = text[0];
            const isValidFirstChar = /^[a-zA-Z0-9\s]/.test(firstChar);
            
            if (!isValidFirstChar) {
                toast.error("Invalid input: Message cannot start with special characters");
                return;
            }

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
        <div className="flex gap-2.5 p-5 border-t border-gray-700 bg-gray-950">
            <input
                value={text}
                onChange={handleTextChange}
                disabled={isLoading}
                className="flex-1 px-2.5 py-2.5 rounded bg-gray-800 text-white border-none outline-none placeholder-gray-500 disabled:opacity-50"
                placeholder="Type your message..."
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) sendMessage();
                }}
            />
            <button 
                onClick={sendMessage} 
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-md hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "..." : "Send"}
            </button>
        </div>
    );
}