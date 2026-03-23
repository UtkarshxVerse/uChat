import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast.error('Error loading profile');
      }
    } else {
      toast.error('No user data found');
      navigate('/');
    }
    setIsLoading(false);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">No user data available</div>
      </div>
    );
  }

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="w-full min-h-screen bg-black relative overflow-hidden sticky top-0">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition"
        >
          Back to Chat
        </button>
      </div>

      {/* Profile Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen pt-10">
        <div className="bg-gray-900/80 backdrop-blur border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md">
          
          {/* Avatar */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-4xl">{userInitial}</span>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-6">
            
            {/* Name */}
            <div className="bg-gray-800/50 rounded-lg pl-3 py-2  border border-gray-700">
              <label className="block text-gray-400 text-sm font-medium">Name</label>
              <p className="text-white text-lg font-semibold">{user.name || 'N/A'}</p>
            </div>

            {/* Email */}
            <div className="bg-gray-800/50 rounded-lg pl-3 py-2 border border-gray-700">
              <label className="block text-gray-400 text-sm font-medium ">Email</label>
              <p className="text-white text-lg font-semibold break-all">{user.email || 'N/A'}</p>
            </div>

            {/* User ID */}
            <div className="bg-gray-800/50 rounded-lg pl-3 py-2 border border-gray-700">
              <label className="block text-gray-400 text-sm font-medium">User ID</label>
              <p className="text-gray-300 text-sm break-all font-mono">{user.id || 'N/A'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <button
              onClick={() => toast.info('Edit profile feature coming soon')}
              className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-lg hover:shadow-blue-500/50"
            >
              Edit Profile
            </button>

            <button
              onClick={() => toast.info('Change password feature coming soon')}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition"
            >
              Change Password
            </button>
          </div>

          {/* Logout Info */}
          <p className="text-center text-gray-500 text-sm mt-6">
            To logout, click the logout button in the navbar
          </p>

        </div>
      </div>
    </div>
  );
}

export default Profile;
