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
    <div className='w-full h-screen relative bg-black flex justify-center items-center'>
      <Plasma
        color="#9383c9"
        speed={0.6}
        direction="forward"
        scale={1.1}
        opacity={0.8}
        mouseInteractive={true}
      />
      <form onSubmit={handleSubmit} className="bg-transparent text-white p-8 rounded-lg shadow-lg w-full max-w-md absolute">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          placeholder="Full Name" 
          className="w-full mb-4 p-2 border rounded bg-gray-800 text-white" 
          disabled={isLoading}
          required
        />
        <input 
          name="email" 
          value={form.email} 
          onChange={handleChange} 
          placeholder="Email" 
          className="w-full mb-4 p-2 border rounded bg-gray-800 text-white" 
          disabled={isLoading}
          required
        />
        <input 
          type="password" 
          name="password" 
          value={form.password} 
          onChange={handleChange} 
          placeholder="Password" 
          className="w-full mb-4 p-2 border rounded bg-gray-800 text-white" 
          disabled={isLoading}
          required
        />
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>

        {/* Go to Login link */}
        <p className="text-center text-gray-600 mt-3 ">
          Already have an account?{' '}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
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