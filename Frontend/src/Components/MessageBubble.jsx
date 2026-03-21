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
      <div
        style={{
          display: "flex",
          justifyContent: isSentByCurrentUser ? "flex-end" : "flex-start",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: isSentByCurrentUser ? "#007bff" : "#2d2d2d",
            color: isSentByCurrentUser ? "white" : "#e5e5ea",
            borderRadius: "12px",
            maxWidth: "60%",
            wordBreak: "break-word",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
          }}
        >
          {message.message}
        </div>
      </div>
    );
  } catch (error) {
    console.error("MessageBubble error:", error);
    return null;
  }
}