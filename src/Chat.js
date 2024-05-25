import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaTrashAlt, FaCopy } from 'react-icons/fa';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Upload from './Upload';

const Chat = ({ selectedBot }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const userMessage = { sender: 'user', text: message };
    setChatHistory([...chatHistory, userMessage]);

    setLoading(true);

    const formData = new FormData();
    formData.append('bot', selectedBot);
    formData.append('message', message);
    if (file) {
      formData.append('file', file);
    }

    axios.post('/chat', formData)
      .then((res) => {
        const botResponse = { sender: 'bot', text: res.data.message };
        setChatHistory((prevHistory) => [...prevHistory, userMessage, botResponse]);
        setLoading(false);
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .catch((error) => {
        console.error('Error sending message:', error);
        const errorResponse = { sender: 'bot', text: 'Error: Unable to get response from the bot.' };
        setChatHistory((prevHistory) => [...prevHistory, userMessage, errorResponse]);
        setLoading(false);
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });

    setMessage('');
  };

  const handleFileRemove = () => {
    setFile(null);
    setFileName('');
  };

  const handleClearChat = () => {
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
  }, [chatHistory]);

  return (
    <div className="flex flex-col h-full w-full max-w-8xl mx-auto"> {/* Увеличили max-w-2xl до max-w-4xl */}
      <div className="flex justify-between items-center mb-2">
        <button
          className="p-2 bg-red-500 text-white rounded"
          onClick={handleClearChat}
        >
          Clear Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-100 rounded-lg shadow-md p-4 mb-2 chat-window">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`mb-4 flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {chat.sender === 'bot' && (
              <img src="/icons/bot-icon.png" alt="Bot" className="w-8 h-8 mr-2" />
            )}
            <div className={`inline-block p-2 rounded-lg ${chat.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
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
                        <SyntaxHighlighter
                          style={prism}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
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
      </div>
      {fileName && (
        <div className="text-gray-500 text-sm mb-2 flex items-center">
          <span>Файл <strong>{fileName}</strong> загружен для анализа</span>
          <FaTrashAlt
            className="ml-2 text-red-500 cursor-pointer"
            onClick={handleFileRemove}
            title="Удалить файл"
          />
        </div>
      )}
      <form onSubmit={handleSubmit} className="w-full flex items-center bg-white rounded-lg shadow-md p-2 sticky bottom-0">
        <Upload setFile={setFile} setFileName={setFileName} />
        <textarea
          className="w-full p-2 border border-gray-300 rounded resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="1"
          placeholder="Message ChatGPT"
          style={{ minHeight: '2rem', maxHeight: '10rem', overflowY: 'auto' }}
        ></textarea>
        <button
          className="p-2 bg-blue-500 text-white rounded ml-2"
          type="submit"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
