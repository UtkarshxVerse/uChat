import React from 'react'
import Home from './Pages/HomePage/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Signup from './Pages/SignupPage/SignUp';
import Login from './Pages/LoginPage/Login';
import { ToastContainer } from 'react-toastify';

function App() {
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
        // transition={Bounce}
      />
      <Routes>
        <Route path='/login' element={token ? <Home /> : <Login />} />
        <Route path='/signup' element={token ? <Home /> : <Signup />} />
        <Route path='/' element={token ? <Home /> : <Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;