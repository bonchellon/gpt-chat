import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaCopy } from 'react-icons/fa';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './Chat.css';

const Chat = ({ chatHistory, loading }) => {
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  return (
    <div className="chat-window-container">
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
    </div>
  );
};

export default Chat;
