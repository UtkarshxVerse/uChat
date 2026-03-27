import React from 'react'
import LightRays from './LightRays';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailStr = form.email.toLowerCase();
    if (!emailStr.endsWith("@gmail.com") && !emailStr.endsWith("@yahoo.com")) {
      toast.error("Only @gmail.com or @yahoo.com emails are allowed");
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await axios.post("http://192.168.10.36:8000/api/auth/login", form);

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        // Store user info for profile display
        if (res.data?.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        toast.success("Login successful!");
        console.log("Login successful:", res.data);
        
        // Force navigation and state update
        setTimeout(() => {
          navigate('/');
          window.location.href = '/';
        }, 100);
      } else {
        // Backend returned success but no token
        const errorMsg = res.data?.message || "No token received from server";
        console.error("Login error:", errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {      
      console.log("Showing error toast:", errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="w-full h-screen relative bg-black flex justify-center items-center">
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1}
        lightSpread={1}
        rayLength={3}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0}
        distortion={3}
        className="custom-rays"
        pulsating={false}
        fadeDistance={1}
        saturation={1}
      />

      <form onSubmit={handleSubmit} className="bg-gray-900/80 backdrop-blur text-white p-8 rounded-xl shadow-2xl w-full max-w-md absolute border border-gray-700">
        <h2 className="text-3xl font-bold mb-8 text-center">Login</h2>
        <div className="space-y-4">
          <input 
            type="email" 
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
          {isLoading ? "Logging in..." : "Login"}
        </button>

        {/* Go to Signup link */}
        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{' '}
          <span
            className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer font-medium transition"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </span>
        </p>
      </form>

    </div>
  )
}

export default Home;