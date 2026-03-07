import React from 'react'
import LightRays from './LightRays';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await axios.post("http://localhost:8000/api/auth/login", form);

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        navigate('/');
        console.log("Login successful:");       
      }
    } catch (error) {
      console.error("Error during login:", error.response?.data || error.message);
    }
  }
  return (
    <div className='w-full h-screen relative bg-black flex justify-center items-center relative'>
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

      <form onSubmit={handleSubmit} className="bg-transparent text-white p-8 rounded-lg shadow-lg w-full max-w-md absolute">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <input type="email" name='email' value={form.email} onChange={handleChange} placeholder="Email" className="w-full mb-4 p-2 border rounded" />
        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full mb-4 p-2 border rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">Login</button>

        {/* Go to Signup link */}
        <p className="text-center text-gray-600 mt-3">
          Don't have an account?{' '}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
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