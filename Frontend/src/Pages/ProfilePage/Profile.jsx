import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setProfilePic(parsedUser.profile_pic);
        setNewName(parsedUser.name);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        setSelectedFile(null);
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadProfilePic = async () => {
    if (!selectedFile) {
      toast.warning('Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('profilePic', selectedFile);

    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:8000/api/auth/upload-profile-pic',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.status === 'success') {
        toast.success('Profile picture uploaded successfully');
        setProfilePic(response.data.profilePicUrl);
        setSelectedFile(null);
        
        // Update user in localStorage with profile_pic
        const updatedUser = { ...user, profile_pic: response.data.profilePicUrl };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Dispatch custom event to notify UserNavbar of the update
        window.dispatchEvent(new Event('userProfileUpdated'));
        
        // Clear file input
        const fileInput = document.getElementById('profilePicInput');
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast.warning('Name cannot be empty');
      return;
    }
    try {
      setIsSavingName(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:8000/api/auth/update-name',
        { newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 'success') {
        toast.success('Name updated successfully');
        const updatedUser = { ...user, name: newName };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('userProfileUpdated'));
        setIsEditingName(false);
      }
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error(error.response?.data?.message || 'Failed to update name');
    } finally {
      setIsSavingName(false);
    }
  };

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
          
          {/* Avatar with Profile Picture */}
          <div className="flex justify-center mb-8 relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden flex-shrink-0">
              {profilePic ? (
                <img
                  src={`http://localhost:8000${profilePic}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}
              {!profilePic && (
                <span className="text-white font-bold text-4xl">{userInitial}</span>
              )}
            </div>
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-black/50 flex items-center justify-center cursor-pointer transition" onClick={() => document.getElementById('profilePicInput').click()}>
              <span className="text-white text-sm font-medium">Change</span>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            id="profilePicInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* User Info */}
          <div className="space-y-6">
            
            {/* Name */}
            <div className="bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700 flex justify-between items-center group relative h-[72px]">
              <div className="flex-1 w-full flex flex-col justify-center">
                <label className="block text-gray-400 text-sm font-medium">Name</label>
                {isEditingName ? (
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-[80%] bg-gray-700 text-white rounded px-2 py-1 outline-none mt-1"
                    autoFocus
                  />
                ) : (
                  <p className="text-white text-lg font-semibold">{user.name || 'N/A'}</p>
                )}
              </div>

              {isEditingName ? (
                <div className="flex gap-2 ml-4">
                  <button 
                    onClick={handleSaveName} 
                    disabled={isSavingName}
                    className="text-green-500 hover:text-green-400 text-sm disabled:text-green-800"
                  >
                    {isSavingName ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={() => { setIsEditingName(false); setNewName(user.name); }} 
                    disabled={isSavingName}
                    className="text-red-500 hover:text-red-400 text-sm disabled:text-red-800"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEditingName(true)} 
                  className="hidden group-hover:block text-blue-400 hover:text-blue-300 text-sm ml-4 absolute right-4"
                >
                  Edit
                </button>
              )}
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

          {/* File Upload Section */}
          {selectedFile && (
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-2">Selected file:</p>
              <p className="text-white text-sm font-medium break-all">{selectedFile.name}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            {selectedFile && (
              <button
                onClick={handleUploadProfilePic}
                disabled={isUploading}
                className="w-full px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold transition shadow-lg hover:shadow-green-500/50"
              >
                {isUploading ? 'Uploading...' : 'Upload Profile Picture'}
              </button>
            )}

            <button
              onClick={() => document.getElementById('profilePicInput').click()}
              className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-lg hover:shadow-blue-500/50"
            >
              {selectedFile ? 'Choose Different Image' : 'Upload Profile Picture'}
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
