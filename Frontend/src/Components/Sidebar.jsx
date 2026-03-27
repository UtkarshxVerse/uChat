import { getConversations, getGroups, createGroup, deleteGroup } from "../Api/axios";
import { getCurrentUserId } from "../Utils/jwtDecode";
import { onUnreadCountUpdate, onUserStatusUpdate, isUserOnline } from "../Services/socket";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";

export default function Sidebar({ setSelectedConversation }) {
    const [conversations, setConversations] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showUsers, setShowUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [addMemberSearch, setAddMemberSearch] = useState("");
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [groups, setGroups] = useState([]);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
    const [createGroupSearch, setCreateGroupSearch] = useState("");
    const [activeChatId, setActiveChatId] = useState(
        // Get active chat from localStorage if available
        localStorage.getItem("activeChatId") || null
    );
    const [unreadCounts, setUnreadCounts] = useState({});
    const [onlineStatuses, setOnlineStatuses] = useState({});

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
            const groupsData = await getGroups();
            setConversations(data);
            setGroups(groupsData);

            // Sync selectedMembers with freshly fetched data
            setSelectedMembers((prevMembers) => {
                let updated = false;
                const newMembers = prevMembers.map((member) => {
                    const fresh = data.find((u) => u.id === member.id);
                    if (fresh && (fresh.name !== member.name || fresh.profile_pic !== member.profile_pic)) {
                        updated = true;
                        return { ...member, ...fresh };
                    }
                    return member;
                });

                if (updated) {
                    localStorage.setItem("selectedMembers", JSON.stringify(newMembers));
                    return newMembers;
                }
                return prevMembers;
            });
        } catch (err) {
            setError("Failed to load conversations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    // Listen for unread count updates from socket
    useEffect(() => {
        const unsubscribe = onUnreadCountUpdate((data) => {
            const key = `${data.from}`;
            setUnreadCounts((prev) => ({
                ...prev,
                [key]: data.unreadCount,
            }));
        });

        return unsubscribe;
    }, []);

    // Listen for user status updates
    useEffect(() => {
        const unsubscribe = onUserStatusUpdate((data) => {
            if (data.type === "users_list") {
                // Initialize online statuses from users list
                const statuses = {};
                data.users.forEach(userId => {
                    statuses[userId] = true;
                });
                setOnlineStatuses(statuses);
            } else {
                // Update individual user status
                const key = `${data.userId}`;
                setOnlineStatuses((prev) => ({
                    ...prev,
                    [key]: data.status === "online",
                }));
            }
        });

        return unsubscribe;
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

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedGroupMembers.length === 0) {
            toast.error("Please provide a group name and select members");
            return;
        }

        try {
            const currentUserId = getCurrentUserId();
            const members = [...selectedGroupMembers.map(u => u.id), currentUserId];

            await createGroup({
                type: "group",
                name: groupName,
                members: members
            });
            toast.success("Group created successfully!");
            setShowCreateGroup(false);
            setGroupName("");
            setSelectedGroupMembers([]);
            setCreateGroupSearch("");
            fetchConversations();
        } catch (err) {
            toast.error("Failed to create group");
        }
    };

    const toggleGroupMember = (user) => {
        if (selectedGroupMembers.find(u => u.id === user.id)) {
            setSelectedGroupMembers(prev => prev.filter(u => u.id !== user.id));
        } else {
            setSelectedGroupMembers(prev => [...prev, user]);
        }
    };

    // Filter selected members for sidebar display
    const allChats = [...selectedMembers, ...groups];
    const uniqueChats = allChats.filter((v, i, a) => a.findIndex(t => (t.id === v.id && !!t.isGroup === !!v.isGroup)) === i);

    const filteredMembers = uniqueChats.filter((member) =>
        (member.name || "Chat").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleConfirmDelete = async () => {
        if (!memberToDelete) return;

        if (memberToDelete.isGroup) {
            try {
                await deleteGroup(memberToDelete.id);
                setGroups((prev) => prev.filter(g => g.id !== memberToDelete.id));
                toast.success("Group deleted!");
            } catch (err) {
                toast.error("Failed to delete group");
            }
        } else {
            // Remove from list
            const newMembers = selectedMembers.filter((u) => u.id !== memberToDelete.id);
            setSelectedMembers(newMembers);
            localStorage.setItem("selectedMembers", JSON.stringify(newMembers));
            toast.info(`${memberToDelete.name} removed from conversations!`);
        }

        setShowUsers(false);

        // Clear active chat if the deleted one was currently open
        if (activeChatId === memberToDelete.id) {
            setSelectedConversation(null);
            setActiveChatId(null);
            localStorage.removeItem("activeChatId");
        }

        setMemberToDelete(null);
    };

    const handleConversationClick = (conv) => {
        setSelectedConversation(conv);
        setActiveChatId(conv.id);
        localStorage.setItem("activeChatId", conv.id); // Save active chat ID to localStorage
    };

    return (
        <div className="w-90 h-screen bg-blue-1000 m-3 rounded-xl border border-gray-600 flex flex-col text-white">
            {/* Header */}
            <div className="px-4 pt-3 border-b border-gray-700">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-2xl font-bold">Messages</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowCreateGroup(true)}
                            className="px-2 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:scale-105 transition"
                            title="Create Group"
                        >
                            + Group
                        </button>
                        <button
                            onClick={() => setShowUsers(true)}
                            className="py-1 px-3 rounded-full text-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-md hover:scale-105 transition"
                        >
                            +
                        </button>
                    </div>
                </div>
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
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl text-center font-bold text-gray-800">Add Members</h2>
                            <button
                                onClick={() => setShowUsers(false)}
                                className="text-gray-500 hover:text-red-500 text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Search inside Add Members */}
                        <div className="mb-4">
                            <input
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition"
                                placeholder="Search new members..."
                                value={addMemberSearch}
                                onChange={(e) => setAddMemberSearch(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {conversations
                                .filter((user) => {
                                    const notAlreadyAdded = !selectedMembers.find((u) => u.id === user.id);
                                    const matchesSearch = user.name.toLowerCase().includes(addMemberSearch.toLowerCase());
                                    return notAlreadyAdded && matchesSearch;
                                })
                                .map((user) => {
                                    const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
                                    return (
                                        <div
                                            key={user.id}
                                            className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0">
                                                    {user.profile_pic ? (
                                                        <img
                                                            src={`http://localhost:8000${user.profile_pic}`}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : null}
                                                    {!user.profile_pic && (
                                                        <span>{userInitial}</span>
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-700 truncate">{user.name}</span>
                                            </div>
                                            <button
                                                onClick={() => addMember(user)}
                                                className="px-3 py-1 text-white rounded-md flex-shrink-0 bg-blue-500 hover:bg-blue-600"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    );
                                })}

                            {conversations.filter((user) => {
                                const notAlreadyAdded = !selectedMembers.find((u) => u.id === user.id);
                                const matchesSearch = user.name.toLowerCase().includes(addMemberSearch.toLowerCase());
                                return notAlreadyAdded && matchesSearch;
                            }).length === 0 && (
                                    <div className="text-center text-gray-500 py-4">
                                        No matching members found
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Group Modal */}
            {showCreateGroup && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                    onClick={() => setShowCreateGroup(false)}
                >
                    <div
                        className="bg-white w-[400px] rounded-xl shadow-2xl p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl text-center font-bold text-gray-800">Create Group</h2>
                            <button
                                onClick={() => setShowCreateGroup(false)}
                                className="text-gray-500 hover:text-red-500 text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-4">
                            <input
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition"
                                placeholder="Search members to add..."
                                value={createGroupSearch}
                                onChange={(e) => setCreateGroupSearch(e.target.value)}
                            />
                        </div>

                        {selectedGroupMembers.length > 0 && (
                            <div className="mb-4 animate-fadeIn">
                                <input
                                    className="w-full px-3 py-2 rounded-lg border border-green-400 bg-green-50 text-gray-900 outline-none focus:border-green-600 focus:bg-white transition"
                                    placeholder="Enter Group Name..."
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="text-sm font-semibold text-gray-600 mb-2">Select Members</div>
                        <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar mb-4">
                            {conversations
                                .filter((user) => user.name.toLowerCase().includes(createGroupSearch.toLowerCase()))
                                .map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200"
                                        onClick={() => toggleGroupMember(user)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!selectedGroupMembers.find(u => u.id === user.id)}
                                            readOnly
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                        <span className="font-medium text-gray-700 truncate">{user.name}</span>
                                    </div>
                                ))}
                        </div>

                        <button
                            onClick={handleCreateGroup}
                            className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:scale-105 transition shadow-md"
                        >
                            Create Group
                        </button>
                    </div>
                </div>
            )}

            {/* Sidebar Conversations */}
            <div className="conversation-list flex-1 px-2 overflow-y-auto">

                {/* Search */}
                <input
                    className="w-full mt-3 px-2 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white mb-2 outline-none focus:border-blue-500 transition"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

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
                    const unreadCount = unreadCounts[conv.id] || 0;
                    const userIsOnline = onlineStatuses[conv.id] || false;

                    return (
                        <div
                            key={conv.id}
                            onClick={() => handleConversationClick(conv)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition relative group
                                ${activeChatId === conv.id
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-blue-600"
                                }`}
                        >
                            {/* Avatar with Online Indicator */}
                            <div className="relative flex-shrink-0">
                                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                                    {conv.profile_pic ? (
                                        <img
                                            src={`http://localhost:8000${conv.profile_pic}`}
                                            alt={chatName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : null}
                                    {!conv.profile_pic && (
                                        <span>{chatName.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>

                                {/* Online Status Dot */}
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${userIsOnline ? "bg-green-400" : "bg-gray-500"
                                    }`}></div>
                            </div>

                            {/* Chat Info */}
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-semibold truncate">{chatName}</span>
                                {conv.isGroup ? (
                                    <span className="text-xs text-indigo-400">Group Chat</span>
                                ) : (
                                    <span className={`text-xs ${userIsOnline ? "text-green-400" : "text-gray-500"}`}>
                                        {userIsOnline ? "● Online" : "● Offline"}
                                    </span>
                                )}
                            </div>

                            {/* Unread Badge */}
                            {unreadCount > 0 && (
                                <div className="flex items-center gap-2 flex-shrink-0 group-hover:opacity-0 transition-opacity">
                                    <div className="text-xs text-yellow-400">Now</div>
                                    <div className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </div>
                                </div>
                            )}

                            {unreadCount === 0 && (
                                <div className="text-xs text-yellow-400 flex-shrink-0 group-hover:opacity-0 transition-opacity">Now</div>
                            )}

                            {/* Remove Member Button on Hover */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMemberToDelete(conv);
                                }}
                                className="opacity-0 group-hover:opacity-100 absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-300 hover:text-red-400 transition"
                                title="Remove conversation"
                            >
                                ✕
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Confirm Delete Modal */}
            {memberToDelete && (
                <div
                    className="fixed inset-0 bg-black/20 bg-opacity-90 flex items-center justify-center z-[60] backdrop-blur-sm"
                    onClick={() => setMemberToDelete(null)}
                >
                    <div
                        className="bg-gray-900 border border-gray-700 w-[350px] rounded-2xl shadow-2xl p-6 text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-3 text-center text-red-500">Delete Chat?</h2>
                        <p className="text-gray-300 text-center mb-6 text-[15px]">
                            Are you sure you want to remove <span className="font-semibold text-white">{memberToDelete.name}</span> from your conversations?
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setMemberToDelete(null)}
                                className="flex-1 py-2 rounded-xl bg-gray-800 border border-gray-600 hover:bg-gray-700 font-medium transition shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition shadow-md"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}