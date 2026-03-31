import React from "react";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages, conversation, groupMembers = [] }) {

    try {
        return (
            <div className="flex-1 overflow-y-auto p-5 flex flex-col custom-scrollbar">
                {messages?.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} conversation={conversation} groupMembers={groupMembers} />
                ))}
            </div>
        );

    } catch (error) {
        console.error("MessageList error:", error);
        return <div>Error loading messages</div>;
    }
}