import React, { useState, useEffect } from 'react';
import Home from './Pages/HomePage/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './Pages/SignupPage/SignUp';
import Login from './Pages/LoginPage/Login';
import { ToastContainer } from 'react-toastify';
import { initSocket } from "./Services/socket";

function App() {
  const [status, setStatus] = useState("Disconnected");
  try {
    // ✅ Only run after the component mounts
    useEffect(() => {
      const socket = initSocket(); // returns socket

      if (!socket) return;

      socket.connect(); // ✅ ensure this is after mount

      socket.on("connect", () => setStatus("Connected"));
      socket.on("disconnect", () => setStatus("Disconnected"));
      socket.on("connect_error", (err) => setStatus("Error"));

      return () => socket.disconnect();
    }, []);
  } catch (error) {
    console.log("ssss", error);
  }


  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path='/login' element={token ? <Home /> : <Login />} />
        <Route path='/signup' element={token ? <Home /> : <Signup />} />
        <Route path='/' element={token ? <Home /> : <Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;