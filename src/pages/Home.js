import React, { useState, useEffect, useRef } from 'react';
import BotSelector from '../components/BotSelector/BotSelector';
import ChatInput from '../components/ChatInput/ChatInput';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaCopy } from 'react-icons/fa';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './Home.css';

const Home = () => {
  const [selectedBot, setSelectedBot] = useState('llama');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef(null);

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  return (
    <div className="home">
      <header className="home-header">
        <div className="container">
          <BotSelector selectedBot={selectedBot} setSelectedBot={setSelectedBot} />
          <button className="clear-chat-button bg-red-500 text-white p-2 rounded" onClick={clearChat}>
            Clear Chat
          </button>
        </div>
      </header>
      <main className="home-chat">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`mb-4 flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {chat.sender === 'bot' && (
              <img src="/icons/bot-icon.png" alt="Bot" className="w-8 h-8 mr-2" />
            )}
            <div className={`inline-block p-2 rounded-lg ${chat.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              <ReactMarkdown rehypePlugins={[rehypeRaw]} components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="code-block">
                      <div className="code-block-header">
                        <span>{match[1]}</span>
                        <CopyToClipboard text={String(children).replace(/\n$/, '')} onCopy={() => setCopied(true)}>
                          <button className="copy-code-btn">
                            <FaCopy /> {copied ? 'Copied!' : 'Copy Code'}
                          </button>
                        </CopyToClipboard>
                      </div>
                      <SyntaxHighlighter style={prism} language={match[1]} PreTag="div" {...props}>
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={className} {...props}>{children}</code>
                  );
                }
              }}>
                {chat.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="mb-4 flex items-center">
            <img src="/icons/bot-icon.png" alt="Bot" className="w-8 h-8 mr-2" />
            <div className="inline-block p-2 rounded-lg bg-gray-200 text-black flex items-center">
              <div className="mr-2">Bot is typing</div>
              <div className="dots"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef}></div>
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
