import React from 'react'
import Plasma from './Plasma';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("http://192.168.10.36:8000/api/auth/signup", form);
      toast.success("Signup successful! Redirecting to login...");
      console.log("Signup successful:", res.data);
      
      setTimeout(() => {
        navigate('/login');
      }, 500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Signup failed";
      console.error("Error during signup:", errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="w-full h-screen relative bg-black flex justify-center items-center">
      <Plasma
        color="#9383c9"
        speed={0.6}
        direction="forward"
        scale={1.1}
        opacity={0.8}
        mouseInteractive={true}
      />
      <form onSubmit={handleSubmit} className="bg-gray-900/80 backdrop-blur text-white p-8 rounded-xl shadow-2xl w-full max-w-md absolute border border-gray-700">
        <h2 className="text-3xl font-bold mb-8 text-center">Sign Up</h2>
        <div className="space-y-4">
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            placeholder="Full Name" 
            className="w-full px-4 py-2.5 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-50" 
            disabled={isLoading}
            required
          />
          <input 
            name="email" 
            value={form.email} 
            onChange={handleChange} 
            placeholder="Email" 
            className="w-full px-4 py-2.5 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-50" 
            disabled={isLoading}
            required
          />
          <input 
            type="password" 
            name="password" 
            value={form.password} 
            onChange={handleChange} 
            placeholder="Password" 
            className="w-full px-4 py-2.5 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-50" 
            disabled={isLoading}
            required
          />
        </div>
        <button 
          type="submit" 
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>

        {/* Go to Login link */}
        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <span
            className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer font-medium transition"
            onClick={() => navigate('/login')}
          >
            Sign In
          </span>
        </p>
      </form>
    </div>
  )
}

export default Home;