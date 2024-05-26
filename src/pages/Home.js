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

  const clearChat = () => {
    axios.post('/clear')
      .then(() => {
        setChatHistory([]);
      })
      .catch((error) => {
        console.error('Error clearing chat history:', error);
      });
  };

  return (
    <div className="home flex flex-col h-screen">
      <header className="home-header flex justify-between items-center">
        <div className="container flex justify-between items-center">
          <BotSelector selectedBot={selectedBot} setSelectedBot={setSelectedBot} />
          <button className="clear-chat-button bg-red-500 text-white p-2 rounded" onClick={clearChat}>
            Clear Chat
          </button>
        </div>
      </header>
      <main className="home-chat flex-1 overflow-y-auto">
        <div className="container h-full">
          <Chat chatHistory={chatHistory} loading={loading} />
        </div>
      </main>
      <footer className="chat-input sticky bottom-0 w-full p-4 bg-white shadow-md">
        <div className="container">
          <ChatInput selectedBot={selectedBot} addMessage={addMessage} setLoading={setLoading} />
        </div>
      </footer>
    </div>
  );
};

export default Home;
