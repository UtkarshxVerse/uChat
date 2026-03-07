import React, { useState } from 'react'
import Prism from './Prism';
import ChatWindow from '../../Components/ChatWindow';
import Sidebar from '../../Components/Sidebar';

function Home() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  return (
    <div className='w-full h-screen relative bg-black overflow-hidden'>
      <div className='absolute inset-0 z-0'> 
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={4}
          baseWidth={6}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0}
          glow={1}
        />
      </div>

      {/* Foreground UI layer */}
      <div className='relative z-10 flex w-full h-full text-white bg-opacity-90 rounded-lg shadow-lg overflow-hidden'>
        <Sidebar
          setSelectedConversation={setSelectedConversation}
        />

        <ChatWindow
          conversation={selectedConversation}
        />
      </div>

    </div>

  )
}

export default Home;