import React, { useEffect, useState } from "react";
import { getConversations } from "../Api/axios";
import { toast } from "react-toastify";
import "./sidebar.css";

export default function Sidebar({ setSelectedConversation }) {
    const [conversations, setConversations] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showUsers, setShowUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeChatId, setActiveChatId] = useState(
        // Get active chat from localStorage if available
        localStorage.getItem("activeChatId") || null
    );

    // Load selectedMembers from localStorage
    useEffect(() => {
        const storedMembers = localStorage.getItem("selectedMembers");
        if (storedMembers) {
            setSelectedMembers(JSON.parse(storedMembers));
        }
    }, []);

    // Fetch conversations
    const fetchConversations = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getConversations();
            setConversations(data);
        } catch (err) {
            setError("Failed to load conversations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    // Add member
    const addMember = (user) => {
        if (!selectedMembers.find((u) => u.id === user.id)) {
            const newMembers = [...selectedMembers, user];
            setSelectedMembers(newMembers);
            localStorage.setItem("selectedMembers", JSON.stringify(newMembers));
            toast.success(`${user.name} added to conversations!`);
            setShowUsers(false); // Close the modal after adding a member
        }
    };

    // Remove member
    const removeMember = (user) => {
        const newMembers = selectedMembers.filter((u) => u.id !== user.id);
        setSelectedMembers(newMembers);
        localStorage.setItem("selectedMembers", JSON.stringify(newMembers));
        toast.info(`${user.name} removed from conversations!`);
        setShowUsers(false); // Close the modal after removing a member
    };

    // Filter selected members for sidebar display
    const filteredMembers = selectedMembers.filter((member) =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleConversationClick = (conv) => {
        setSelectedConversation(conv);
        setActiveChatId(conv.id);
        localStorage.setItem("activeChatId", conv.id); // Save active chat ID to localStorage
    };

    return (
        <div className="sidebar bg-gray-900 text-white h-full flex flex-col">
            {/* Header */}
            <div className="sidebar-header px-4 py-4">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-3xl font-bold">Chats</h2>
                    <button
                        onClick={() => setShowUsers(true)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-md hover:scale-105 transition"
                    >
                        Add Members
                    </button>
                </div>

                {/* Search */}
                <input
                    className="w-full p-2 rounded-lg border border-gray-700 bg-gray-800 text-white mb-2"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Add Members Modal */}
            {showUsers && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                    onClick={() => setShowUsers(false)}
                >
                    <div
                        className="bg-white w-[400px] rounded-xl shadow-2xl p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-gray-800">Add Members</h2>
                            <button
                                onClick={() => setShowUsers(false)}
                                className="text-gray-500 hover:text-red-500 text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {conversations.map((user) => {
                                const alreadyAdded = selectedMembers.find(
                                    (u) => u.id === user.id
                                );
                                return (
                                    <div
                                        key={user.id}
                                        className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                                    >
                                        <span className="font-medium text-gray-700">{user.name}</span>
                                        <button
                                            onClick={() =>
                                                alreadyAdded ? removeMember(user) : addMember(user)
                                            }
                                            className={`px-3 py-1 text-white rounded-md ${alreadyAdded
                                                    ? "bg-red-500 hover:bg-red-600"
                                                    : "bg-blue-500 hover:bg-blue-600"
                                                }`}
                                        >
                                            {alreadyAdded ? "Remove" : "Add"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar Conversations */}
            <div className="conversation-list flex-1 px-2 overflow-y-auto">
                {loading && (
                    <div className="text-center text-gray-500 py-6 animate-pulse">
                        Loading chats...
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-500 py-6">{error}</div>
                )}
                {!loading && filteredMembers.length === 0 && (
                    <div className="text-center text-gray-400 py-6">
                        No members found
                    </div>
                )}

                {filteredMembers.map((conv) => {
                    const chatName = conv.name || "Chat";

                    return (
                        <div
                            key={conv.id}
                            onClick={() => handleConversationClick(conv)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition
                                ${activeChatId === conv.id
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-blue-600"
                                }`}
                        >
                            {/* Avatar */}
                            <div
                                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow"
                                style={{ background: "#F7B400" }}
                            >
                                {chatName.charAt(0).toUpperCase()}
                            </div>

                            {/* Chat Info */}
                            <div className="flex flex-col flex-1">
                                <span className="font-semibold">{chatName}</span>
                                <span className="text-sm text-gray-400 truncate">
                                    Start a conversation...
                                </span>
                            </div>

                            <div className="text-xs text-yellow-400">Now</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}