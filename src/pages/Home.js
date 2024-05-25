import React, { useState, useEffect } from 'react';
import BotSelector from '../components/BotSelector/BotSelector';
import Chat from '../components/Chat/Chat';
import ChatInput from '../components/ChatInput/ChatInput';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [selectedBot, setSelectedBot] = useState('llama');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/history')
      .then((res) => {
        setChatHistory(res.data.map(item => [
          { sender: 'user', text: item.user_message },
          { sender: 'bot', text: item.bot_response }
        ]).flat());
      })
      .catch((error) => {
        console.error('Error fetching chat history:', error);
      });
  }, []);

  const addMessage = (message) => {
    setChatHistory(prevHistory => [...prevHistory, message]);
  };

  return (
    <div className="home flex flex-col h-screen">
      <header className="home-header flex justify-between items-center p-4 bg-gray-100 shadow-md">
        <BotSelector selectedBot={selectedBot} setSelectedBot={setSelectedBot} />
        <button className="clear-chat-button bg-red-500 text-white p-2 rounded" onClick={() => window.clearChat()}>
          Clear Chat
        </button>
      </header>
      <main className="home-chat flex-1 overflow-y-auto p-4">
        <Chat chatHistory={chatHistory} loading={loading} />
      </main>
      <footer className="chat-input sticky bottom-0 w-full p-4 bg-white shadow-md">
        <ChatInput selectedBot={selectedBot} addMessage={addMessage} setLoading={setLoading} />
      </footer>
    </div>
  );
};

export default Home;
