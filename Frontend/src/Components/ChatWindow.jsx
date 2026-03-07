import React, { useEffect, useState } from "react";
import { getMessages } from "../Api/axios.js";
import { getSocket } from "../Services/socket.js";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow({ conversation }) {

    const [messages, setMessages] = useState([]);

    const fetchMessages = async () => {
        try {
            if (!conversation) return;
            const data = await getMessages(conversation.id);
            setMessages(data);
        } catch (error) {
            console.error("Message fetch error:", error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [conversation]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        socket.on("receive_message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.off("receive_message");
        };
    }, []);

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
                        <div style={{ fontSize: "12px", color: "#aaa" }}>
                            Online
                        </div>
                    </div>
                </div>
                {/* Delete User Button
                <div>
                    <button
                        // onClick={deleteUser}
                        className="px-4 py-2 mr-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-md hover:scale-105 transition"
                    >
                        Remove User
                    </button>
                </div> */}
            </div>

            <MessageList messages={messages} />

            <MessageInput
                conversation={conversation}
                setMessages={setMessages}
            />
        </div>
    );
}