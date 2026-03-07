import React from 'react'
import Plasma from './Plasma';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8000/api/auth/signup", form);
      navigate('/login');
    } catch (error) {
      console.error("Error during signup:", error.response?.data || error.message);
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
        <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="w-full mb-4 p-2 border rounded" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full mb-4 p-2 border rounded" />
        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full mb-4 p-2 border rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">Sign Up</button>

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