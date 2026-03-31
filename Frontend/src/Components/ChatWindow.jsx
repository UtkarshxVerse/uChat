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
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const messageIdsRef = React.useRef(new Set());
    const fileInputRef = React.useRef(null);

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

            // If it's a group, fetch members silently on load to map sender details
            if (conversation.isGroup) {
                getGroupMembers(conversation.id)
                    .then(members => setGroupMembersList(members))
                    .catch(err => console.error("Failed to load group members:", err));
            } else {
                setGroupMembersList([]);
            }
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
                    sender_id: msg.isGroup ? msg.realSenderId : msg.from,
                    receiver_id: currentUserId,
                    group_id: msg.isGroup ? msg.from : null,
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

    const handleNameClick = async () => {
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

    const handleAvatarClick = async (profilePic, name) => {
        // If it's a group, fetch members and show group profile modal
        if (conversation.isGroup) {
            try {
                const members = await getGroupMembers(conversation.id);
                setGroupMembersList(members);
                setSelectedProfile({ profilePic, name, isGroup: true });
            } catch (err) {
                console.error("Failed to load group members:", err);
            }
        } else {
            // For individual users, show simple profile modal
            setSelectedProfile({ profilePic, name, isGroup: false });
        }
    };

    const handleGroupPicUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !conversation.isGroup) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('groupPic', file);

            const token = localStorage.getItem('token');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/conversations/groups/${conversation.id}/picture`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            setSelectedProfile(prev => ({
                ...prev,
                profilePic: data.profilePic
            }));

            // Refresh page to update sidebar
            setTimeout(() => {
                window.location.reload();
            }, 500);

        } catch (error) {
            console.error('Error uploading group picture:', error);
            alert('Failed to upload group picture');
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
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
                        className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-base overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400 transition`}
                        onClick={() => handleAvatarClick(conversation.profile_pic, chatName)}
                    >
                        {conversation.profile_pic ? (
                            <img
                                src={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000'}${conversation.profile_pic}`}
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
                        <div className="font-semibold cursor-pointer hover:scale-105 transition" onClick={handleNameClick}>{chatName}</div>
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

            <MessageList messages={messages} conversation={conversation} groupMembers={groupMembersList} />

            <div className="flex-shrink-0">
                <MessageInput
                    conversation={conversation}
                    setMessages={setMessages}
                />
            </div>

            {/* Group Members Modal (Old - Kept for backward compatibility) */}
            {showGroupMembers && !selectedProfile && (
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
                                        <div
                                            className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-base overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
                                            onClick={() => setSelectedProfile({ profilePic: member.profile_pic, name: member.name, isGroup: false })}
                                        >
                                            {member.profile_pic ? (
                                                <img
                                                    src={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000'}${member.profile_pic}`}
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

            {/* Profile Picture Modal - Individual User */}
            {selectedProfile && !selectedProfile.isGroup && (
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl"
                    onClick={() => setSelectedProfile(null)}
                >
                    <div
                        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 text-white flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedProfile(null)}
                            className="self-end text-gray-400 hover:text-red-500 text-lg transition mb-4"
                        >
                            ✕
                        </button>
                        <div className="w-[300px] h-[300px] rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center overflow-hidden mb-4">
                            {selectedProfile.profilePic ? (
                                <img
                                    src={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000'}${selectedProfile.profilePic}`}
                                    alt={selectedProfile.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <span className="text-6xl font-bold">{selectedProfile.name?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-center">{selectedProfile.name}</h2>
                    </div>
                </div>
            )}

            {/* Group Profile Modal - With Members */}
            {selectedProfile && selectedProfile.isGroup && (
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl"
                    onClick={() => setSelectedProfile(null)}
                >
                    <div
                        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 text-white flex flex-col min-w-[400px] max-h-[600px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Group Info</h2>
                            <button
                                onClick={() => setSelectedProfile(null)}
                                className="text-gray-400 hover:text-red-500 text-lg transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Group Picture */}
                        <div className="w-full h-[250px] rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center overflow-hidden mb-4 relative group cursor-pointer">
                            {selectedProfile.profilePic ? (
                                <img
                                    src={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000'}${selectedProfile.profilePic}`}
                                    alt={selectedProfile.name}
                                    className=" object-cover"

                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <span className="text-5xl font-bold">{selectedProfile.name?.charAt(0).toUpperCase()}</span>
                            )}
                            {/* Upload Button Overlay */}
                            <button
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg disabled:cursor-not-allowed"
                            >
                                <span className="text-white text-lg font-semibold">
                                    {uploading ? '⏳ Uploading...' : '📸 Upload'}
                                </span>
                            </button>
                        </div>

                        {/* Hidden File Input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleGroupPicUpload}
                            disabled={uploading}
                        />

                        {/* Group Name */}
                        <h3 className="text-2xl font-bold text-center mb-4">{selectedProfile.name}</h3>

                        {/* Members Count */}
                        <div className="text-center text-gray-400 mb-4 text-sm">
                            {groupMembersList.length} members
                        </div>

                        {/* Group Members List */}
                        <div className="space-y-2 overflow-y-auto custom-scrollbar max-h-[250px]">
                            {groupMembersList.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">No members found</p>
                            ) : (
                                groupMembersList.map((member) => (
                                    <div key={member.id} className="flex items-center mx-3 gap-3 bg-gray-800 p-3 rounded-xl border border-gray-700 hover:bg-gray-750 transition">
                                        <div
                                            className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-base overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition flex-shrink-0"
                                            onClick={() => setSelectedProfile({ profilePic: member.profile_pic, name: member.name, isGroup: false })}
                                        >
                                            {member.profile_pic ? (
                                                <img
                                                    src={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000'}${member.profile_pic}`}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span>{member.name ? member.name.charAt(0).toUpperCase() : 'U'}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium text-white truncate">{member.name}</span>
                                            <span className="text-xs text-gray-400 truncate">{member.email}</span>
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