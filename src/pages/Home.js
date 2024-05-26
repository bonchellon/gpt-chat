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
    <div className="home">
      <main className="home-chat">
        <header className="home-header">
          <div className="container">
            <BotSelector selectedBot={selectedBot} setSelectedBot={setSelectedBot} />
            <button className="clear-chat-button bg-red-500 text-white p-2 rounded" onClick={clearChat}>
              Clear Chat
            </button>
          </div>
        </header>
        <Chat chatHistory={chatHistory} loading={loading} />
      </main>
      <footer className="chat-input">
        <div className="container">
          <ChatInput selectedBot={selectedBot} addMessage={addMessage} setLoading={setLoading} />
        </div>
      </footer>
    </div>
  );
};

export default Home;
