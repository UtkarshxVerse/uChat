import React from "react";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages }) {

    try {
        return (
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                {messages?.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
            </div>
        );

    } catch (error) {
        console.error("MessageList error:", error);
        return <div>Error loading messages</div>;
    }
}