import React from "react";

export default function ConversationItem({ conversation, onClick, unreadCount = 0 }) {
    try {
        return (
            <div
                onClick={onClick}
                className={`flex items-center justify-between p-3 border-b border-gray-700 cursor-pointer text-white transition ${
                  unreadCount > 0 ? "bg-red-950/20" : "bg-transparent"
                }`}
            >
                <strong>{conversation.name}</strong>
                {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
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