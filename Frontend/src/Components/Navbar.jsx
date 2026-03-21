import React, { useEffect, useState } from 'react'
import { onUnreadCountUpdate, onUserStatusUpdate, getOnlineUsers } from "../Services/socket";

function Navbar() {
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineCount, setOnlineCount] = useState(0);

  // Listen for unread count updates
  useEffect(() => {
    const unsubscribe = onUnreadCountUpdate((data) => {
      const key = `${data.from}`;
      setUnreadCounts((prev) => {
        const newCounts = { ...prev, [key]: data.unreadCount };
        
        // Calculate total unread count
        const total = Object.values(newCounts).reduce((sum, count) => sum + count, 0);
        setTotalUnread(total);
        
        return newCounts;
      });
    });

    return unsubscribe;
  }, []);

  // Listen for user status updates
  useEffect(() => {
    const unsubscribe = onUserStatusUpdate((data) => {
      if (data.type === "users_list") {
        setOnlineCount(data.users.length);
      } else {
        // Update online count based on status changes
        const onlineUsers = getOnlineUsers();
        setOnlineCount(onlineUsers.length);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-white">ChatApp</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
          <span>{onlineCount} online</span>
        </div>
      </div>

      {/* Total Unread Badge */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center">
          <div className="text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          {/* Unread Badge */}
          {totalUnread > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {totalUnread > 99 ? "99+" : totalUnread}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-400">
          {totalUnread > 0 && (
            <span className="text-red-400 font-semibold">
              {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar