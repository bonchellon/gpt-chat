import React, { useState } from 'react';
import axios from 'axios';
import Upload from '../Upload/Upload';
import { FaTrashAlt } from 'react-icons/fa';
import './ChatInput.css';

const ChatInput = ({ selectedBot, addMessage, setLoading }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const userMessage = { sender: 'user', text: message };
    addMessage(userMessage); // Добавляем сообщение пользователя сразу

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
        addMessage(botResponse);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error sending message:', error);
        const errorResponse = { sender: 'bot', text: 'Error: Unable to get response from the bot.' };
        addMessage(errorResponse);
        setLoading(false);
      });

    setMessage('');
    setFile(null);
    setFileName('');
  };

  const handleFileRemove = () => {
    setFile(null);
    setFileName('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <Upload setFile={setFile} setFileName={setFileName} />
        <textarea
          className="message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="1"
          placeholder="Message ChatGPT"
        ></textarea>
        <button className="send-button" type="submit">Send</button>
      </form>
      {fileName && (
        <div className="uploaded-file">
          <span>Файл <strong>{fileName}</strong> загружен для анализа</span>
          <FaTrashAlt className="remove-file-icon" onClick={handleFileRemove} />
        </div>
      )}
    </div>
  );
};

export default ChatInput;
