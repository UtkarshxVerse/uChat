import React from "react";

export default function ConversationItem({ conversation, onClick, unreadCount = 0 }) {
    try {
        const userInitial = conversation.name ? conversation.name.charAt(0).toUpperCase() : 'U';

        return (
            <div
                onClick={onClick}
                className={`flex items-center justify-between p-3 border-b border-gray-700 cursor-pointer text-white transition ${
                  unreadCount > 0 ? "bg-red-950/20" : "bg-transparent"
                }`}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                        {conversation.profile_pic ? (
                            <img
                                src={`http://localhost:8000${conversation.profile_pic}`}
                                alt={conversation.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : null}
                        {!conversation.profile_pic && (
                            <span>{userInitial}</span>
                        )}
                    </div>
                    <strong className="truncate">{conversation.name}</strong>
                </div>
                {unreadCount > 0 && (
                    <span className="px-2 py-0.5 ml-2 bg-red-600 text-white text-xs font-bold rounded-full flex-shrink-0">
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