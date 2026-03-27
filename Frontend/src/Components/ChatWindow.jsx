import React, { useEffect, useState } from "react";
import { getMessages, getGroupMembers } from "../Api/axios.js";
import { getSocket, markAsRead, onUserStatusUpdate, isUserOnline } from "../Services/socket.js";
import { getCurrentUserId } from "../Utils/jwtDecode";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow({ conversation }) {

    const [messages, setMessagesState] = useState([]);
    const [isOnline, setIsOnline] = useState(false);
    const [showGroupMembers, setShowGroupMembers] = useState(false);
    const [groupMembersList, setGroupMembersList] = useState([]);
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
            const data = await getMessages(conversation.id, !!conversation.isGroup);
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
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-black/30 rounded-xl m-2">
                Select a chat to start messaging
            </div>
        );
    }

    const chatName = conversation.name || "Private Chat";

    const handleAvatarClick = async () => {
        if (conversation.isGroup) {
            try {
                const members = await getGroupMembers(conversation.id);
                setGroupMembersList(members);
                setShowGroupMembers(true);
            } catch (err) {
                console.error("Failed to load group members:", err);
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-transparent shadow-2xl border border-gray-700 rounded-2xl m-2 relative">
            {/* CHAT HEADER */}
            <div className="flex-shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3 px-5 py-3.75 border-b border-gray-700 bg-black/30 text-white w-full">
                    {/* Avatar with Profile Picture */}
                    <div 
                        onClick={handleAvatarClick}
                        className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-base overflow-hidden flex-shrink-0 ${conversation.isGroup ? "cursor-pointer hover:ring-2 hover:ring-blue-400 transition" : ""}`}
                        title={conversation.isGroup ? "View Group Members" : ""}
                    >
                        {conversation.profile_pic ? (
                            <img
                                src={`http://localhost:8000${conversation.profile_pic}`}
                                alt={chatName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : null}
                        {!conversation.profile_pic && (
                            <span>{chatName.charAt(0).toUpperCase()}</span>
                        )}
                    </div>

                    {/* Name + Status */}
                    <div>
                        <div className="font-semibold">{chatName}</div>
                        {!conversation.isGroup && (
                            <div className={`text-xs flex items-center gap-1.5 ${isOnline ? "text-green-400" : "text-gray-400"
                                }`}>
                                <span className={`w-2 h-2 rounded-full inline-block ${isOnline ? "bg-green-400" : "bg-gray-500"
                                    }`}></span>
                                {isOnline ? "Online" : "Offline"}
                            </div>
                        )}
                        {conversation.isGroup && (
                            <div className="text-xs text-gray-400 flex items-center gap-1.5">
                                Group Chat
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <MessageList messages={messages} conversation={conversation} />

            <div className="flex-shrink-0">
                <MessageInput
                    conversation={conversation}
                    setMessages={setMessages}
                />
            </div>

            {/* Group Members Modal */}
            {showGroupMembers && (
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl"
                    onClick={() => setShowGroupMembers(false)}
                >
                    <div
                        className="bg-gray-900 border border-gray-700 w-[350px] rounded-2xl shadow-2xl p-6 text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{chatName} Members</h2>
                            <button
                                onClick={() => setShowGroupMembers(false)}
                                className="text-gray-400 hover:text-red-500 text-lg transition"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {groupMembersList.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">No members found</p>
                            ) : (
                                groupMembersList.map((member) => (
                                    <div key={member.id} className="flex items-center gap-3 bg-gray-800 p-3 rounded-xl border border-gray-700">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-base overflow-hidden">
                                            {member.profile_pic ? (
                                                <img
                                                    src={`http://localhost:8000${member.profile_pic}`}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span>{member.name ? member.name.charAt(0).toUpperCase() : 'U'}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">{member.name}</span>
                                            <span className="text-xs text-gray-400">{member.email}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}