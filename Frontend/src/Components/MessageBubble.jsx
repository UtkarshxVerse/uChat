import React from "react";
import { getCurrentUserId } from "../Utils/jwtDecode";

export default function MessageBubble({ message }) {
  try {
    const currentUserId = getCurrentUserId();
    // console.log("Current User ID:", currentUserId, "Message sender_id:", message.sender_id);

    // If sender_id matches current user, this message was SENT by us (RIGHT side)
    // Otherwise, it was RECEIVED from another user (LEFT side)
    const isSentByCurrentUser = message.sender_id === currentUserId;
    // console.log("Is sent by current user:", isSentByCurrentUser);

    return (
      <div className={`flex mb-2.5 ${isSentByCurrentUser ? "justify-end" : "justify-start"}`}>
        <div className={`px-3.5 py-2.5 rounded-lg max-w-xs break-words shadow-sm ${
          isSentByCurrentUser 
            ? "bg-blue-500 text-white" 
            : "bg-gray-700 text-gray-200"
        }`}>
          {message.message}
        </div>
      </div>
    );
  } catch (error) {
    console.error("MessageBubble error:", error);
    return null;
  }
}