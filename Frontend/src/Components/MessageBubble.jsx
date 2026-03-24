import React, { useState, useEffect } from "react";
import { getCurrentUserId } from "../Utils/jwtDecode";

export default function MessageBubble({ message, conversation }) {
  try {
    const [currentUser, setCurrentUser] = useState(null);
    const currentUserId = getCurrentUserId();

    useEffect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }, []);

    const isSentByCurrentUser = message.sender_id === currentUserId;
    
    // Get profile picture and name based on sender
    const senderProfilePic = isSentByCurrentUser 
      ? currentUser?.profile_pic 
      : conversation?.profile_pic;
    
    const senderName = isSentByCurrentUser 
      ? currentUser?.name 
      : conversation?.name;
    
    const senderInitial = senderName 
      ? senderName.charAt(0).toUpperCase() 
      : 'U';

    return (
      <div className={`flex mb-4 ${isSentByCurrentUser ? "justify-end" : "justify-start"} items-end gap-2`}>
        {/* Sender Avatar - Show on left for received messages */}
        {!isSentByCurrentUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden">
            {senderProfilePic ? (
              <img
                src={`http://localhost:8000${senderProfilePic}`}
                alt={senderName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : null}
            {!senderProfilePic && (
              <span>{senderInitial}</span>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div className={`px-3.5 py-2.5 rounded-lg max-w-xs break-words shadow-sm ${
          isSentByCurrentUser 
            ? "bg-blue-500 text-white rounded-br-none" 
            : "bg-gray-700 text-gray-200 rounded-bl-none"
        }`}>
          {message.message}
        </div>

        {/* Sender Avatar - Show on right for sent messages */}
        {isSentByCurrentUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden">
            {senderProfilePic ? (
              <img
                src={`http://localhost:8000${senderProfilePic}`}
                alt={senderName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : null}
            {!senderProfilePic && (
              <span>{senderInitial}</span>
            )}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("MessageBubble error:", error);
    return null;
  }
}