import React from "react";

export default function ConversationItem({ conversation, onClick, unreadCount = 0 }) {
    try {
        return (
            <div
                onClick={onClick}
                style={{
                    padding: "12px",
                    borderBottom: "1px solid #333",
                    cursor: "pointer",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: unreadCount > 0 ? "rgba(220, 38, 38, 0.1)" : "transparent",
                }}
            >
                <strong>{conversation.name}</strong>
                {unreadCount > 0 && (
                    <span
                        style={{
                            background: "#dc2626",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "bold",
                        }}
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </div>
        );
    } catch (error) {
        console.error("Conversation render error:", error);
        return null;
    }
}