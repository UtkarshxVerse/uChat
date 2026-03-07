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

// Fetch messages with a specific user
export const getMessages = async (userId) => {
  try {
    const res = await API.get(`/messages/${userId}`);
    return res.data.messages || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Send a message to a specific user
export const createMessage = async (data) => {
  // data expected to be { receiverId: <user.id>, message: "text" }
  try {
    const res = await API.post("/messages", data);
    return res.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};