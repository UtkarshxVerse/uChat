import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.10.36:8000/api",
});

// Intercept requests and add authorization token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Fetch all available users (treated as conversations for 1:1 direct chat)
export const getConversations = async () => {
  try {
    const res = await API.get("/auth/users/recipient-list");
    return res.data.users || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Fetch user's conversation history (users they've chatted with)
export const getUserConversationHistory = async () => {
  try {
    const res = await API.get("/messages/conversations");
    return res.data.conversations || [];
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    // If endpoint doesn't exist, return empty array
    return [];
  }
};

// Fetch messages with a specific user
export const getMessages = async (userId, isGroup = false) => {
  try {
    const res = await API.get(`/messages/${userId}?isGroup=${isGroup}`);
    return res.data.messages || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Send a message to a specific user or group
export const createMessage = async (data) => {
  // data expected to be { receiverId: <user.id>, message: "text", isGroup: boolean }
  try {
    const res = await API.post("/messages", data);
    return res.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Create a new group chat
export const createGroup = async (data) => {
  // data expected to be { type: "group", name: "My Group", members: [1, 2, 3] }
  try {
    const res = await API.post("/conversations/create", data);
    return res.data;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

// Fetch user's group chats
export const getGroups = async () => {
  try {
    const res = await API.get("/conversations/groups");
    return res.data.data || [];
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
};

// Delete a group chat
export const deleteGroup = async (groupId) => {
  try {
    const res = await API.delete(`/conversations/groups/${groupId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};

// Fetch group members
export const getGroupMembers = async (groupId) => {
  try {
    const res = await API.get(`/conversations/groups/${groupId}/members`);
    return res.data.data || [];
  } catch (error) {
    console.error("Error fetching group members:", error);
    return [];
  }
};

