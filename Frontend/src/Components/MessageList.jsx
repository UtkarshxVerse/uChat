import React from "react";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages }) {

    try {
        return (
            <div className="flex-1 overflow-y-auto p-5 flex flex-col">
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