import React from "react";

export default function MessageBubble({ message }) {
  try {
    const isSender = message.sender_id === JSON.parse(localStorage.getItem('user'))?.id;
    return (
      <div
        style={{
          marginBottom: "10px",
          padding: "10px",
          background: isSender ? "#007bff" : "#333",
          color: "white",
          borderRadius: "8px",
          maxWidth: "60%",
          alignSelf: isSender ? "flex-end" : "flex-start",
        }}
      >
        {message.message}
      </div>
    );
  } catch (error) {
    console.error("MessageBubble error:", error);
    return null;
  }
}