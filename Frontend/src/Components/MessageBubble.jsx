import React from "react";

export default function MessageBubble({ message }) {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    const currentUserId = user?.id;

    const isSender = message.sender_id === currentUserId;

    return (
      <div
        style={{
          display: "flex",
          justifyContent: isSender ? "flex-end" : "flex-start",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: isSender ? "#007bff" : "#e5e5ea",
            color: isSender ? "white" : "black",
            borderRadius: "12px",
            maxWidth: "60%",
            wordBreak: "break-word",
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