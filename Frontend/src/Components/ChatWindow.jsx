import React, { useEffect, useState } from "react";
import { getMessages } from "../Api/axios.js";
import { getSocket, markAsRead, onUserStatusUpdate, isUserOnline } from "../Services/socket.js";
import { getCurrentUserId } from "../Utils/jwtDecode";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow({ conversation }) {

    const [messages, setMessagesState] = useState([]);
    const [isOnline, setIsOnline] = useState(false);
    const messageIdsRef = React.useRef(new Set());

    // Custom setMessages that also tracks IDs
    const setMessages = (updater) => {
        setMessagesState((prev) => {
            const newMessages = typeof updater === 'function' ? updater(prev) : updater;
            
            // If it's a new set of messages, rebuild the tracker
            if (!Array.isArray(newMessages)) return newMessages;
            
            // Track all message IDs
            newMessages.forEach(msg => {
                const msgKey = `${msg.sender_id}_${msg.message}_${msg.timestamp || msg.created_at}`;
                messageIdsRef.current.add(msgKey);
            });
            
            return newMessages;
        });
    };

    const fetchMessages = async () => {
        try {
            if (!conversation) return;
            const data = await getMessages(conversation.id);
            setMessages(data);
            // Mark conversation as read when opened
            markAsRead(conversation.id);
        } catch (error) {
            console.error("Message fetch error:", error);
        }
    };

    useEffect(() => {
        // Clear tracker when conversation changes
        messageIdsRef.current.clear();
        fetchMessages();
        
        // Check initial online status
        if (conversation) {
            setIsOnline(isUserOnline(conversation.id));
        }
    }, [conversation]);

    // Listen for user status changes
    useEffect(() => {
        const unsubscribe = onUserStatusUpdate((data) => {
            if (conversation && data.userId === conversation.id) {
                setIsOnline(data.status === "online");
            }
        });

        return unsubscribe;
    }, [conversation]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket || !conversation) return;

        const handleReceiveMessage = (msg) => {
            console.log("📨 Received message from socket:", msg);
            const currentUserId = getCurrentUserId();
            
            // Only add message if it's from the current conversation partner
            if (msg.from === conversation.id) {
                const msgKey = `${msg.from}_${msg.message}_${msg.timestamp}`;
                
                // Check if message already exists to prevent duplicates
                if (messageIdsRef.current.has(msgKey)) {
                    console.log("⏭️ Duplicate message ignored:", msgKey);
                    return;
                }

                const newMessage = {
                    id: msgKey,
                    sender_id: msg.from,
                    receiver_id: currentUserId,
                    message: msg.message,
                    timestamp: msg.timestamp || new Date().toISOString(),
                    created_at: msg.timestamp || new Date().toISOString()
                };

                messageIdsRef.current.add(msgKey);
                setMessages((prev) => [...prev, newMessage]);
                console.log("✅ Message added:", msgKey);
            }
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [conversation]);

    if (!conversation) {
        return (
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#888",
                    background: "rgba(0,0,0,0.5)",
                }}
            >
                Select a chat to start messaging
            </div>
        );
    }

    const chatName = conversation.name || "Private Chat";

    return (
        <div
            style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                background: "rgba(10, 10, 10, 0.85)",
            }}
        >
            {/* CHAT HEADER */}
            <div className="flex items-center justify-between">
                <div
                    style={{
                        padding: "15px 20px",
                        borderBottom: "1px solid #333",
                        background: "#111",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    {/* Avatar */}
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "#4a90e2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "16px",
                        }}
                    >
                        {chatName.charAt(0).toUpperCase()}
                    </div>

                    {/* Name + Status */}
                    <div>
                        <div style={{ fontWeight: "600" }}>{chatName}</div>
                        <div style={{ fontSize: "12px", color: isOnline ? "#4ade80" : "#aaa", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span
                                style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    background: isOnline ? "#4ade80" : "#666",
                                    display: "inline-block",
                                }}
                            ></span>
                            {isOnline ? "Online" : "Offline"}
                        </div>
                    </div>
                </div>
            </div>

            <MessageList messages={messages} />

            <MessageInput
                conversation={conversation}
                setMessages={setMessages}
            />
        </div>
    );
}