import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSocket } from '../Services/socket';

function UserNavbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('UserNavbar - Stored user:', storedUser);
    console.log('UserNavbar - All localStorage keys:', Object.keys(localStorage));
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  }, []);

  // Listen for storage changes (updates from other tabs/windows)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
        } else {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for profile picture updates within the same tab
  useEffect(() => {
    const handleUserUpdate = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    // Custom event listener for profile picture updates
    window.addEventListener('userProfileUpdated', handleUserUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleUserUpdate);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');

    // Disconnect socket
    try {
      const socket = getSocket();
      if (socket) {
        socket.disconnect();
        console.log('Socket disconnected');
      }
    } catch (error) {
      console.log('Socket already disconnected or not available');
    }

    // Clear only authentication data - keep conversation history
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // DO NOT remove selectedMembers and activeChatId - keep conversation history for next login

    setIsOpen(false);
    toast.success('Logged out successfully');

    // Use a small timeout and hard redirect for instant effect
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  };

  if (!user) {
    return (
      <div className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="text-gray-300 font-semibold"></div>
        <div className="text-gray-400 text-sm">No user data - Please login</div>
      </div>
    );
  }

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="bg-blue-1000 border-b rounded-xl m-3 border-gray-700 px-4 py-2 flex items-center justify-between">
      <div className="text-gray-300 text-4xl font-bold"><img src="../public/image.png" alt="" className='h-13 w-20' /></div>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 hover:bg-gray-800 px-3 py-2 rounded-lg transition"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
            {user.profile_pic ? (
              <img
                src={`http://localhost:8000${user.profile_pic}`}
                alt="Profile"
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
          <span className="text-gray-200 text-md font-bold hidden sm:inline">{user.name}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
            <div className="px-4 py-3 border-b border-gray-700">
              <p className="text-white font-semibold text-sm">{user.name}</p>
              <p className="text-gray-400 text-xs">{user.email}</p>
            </div>
            <div className="py-2">
              <button
                onClick={() => {
                  navigate('/profile');
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition text-sm"
              >
                View Profile
              </button>
              <button
                onClick={() => {
                  toast.info('Settings coming soon');
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition text-sm"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserNavbar;
