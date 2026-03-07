import React from "react";

export default function ConversationItem({ conversation, onClick }) {
    try {
        return (
            <div
                onClick={onClick}
                style={{
                    padding: "12px",
                    borderBottom: "1px solid #333",
                    cursor: "pointer",
                    color: "white"
                }}
            >
                <strong>{conversation.name}</strong>
            </div>
        );
    } catch (error) {
        console.error("Conversation render error:", error);
        return null;
    }
}