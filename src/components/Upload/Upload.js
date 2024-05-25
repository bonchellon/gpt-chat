import React, { useRef } from 'react';
import { FaPaperclip } from 'react-icons/fa';
import axios from 'axios';
import './Upload.css';

const Upload = ({ setFile, setFileName }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    axios.post('/upload', formData)
      .then((res) => {
        // Обработка ответа при необходимости
      })
      .catch((error) => console.error('Error uploading file:', error));
  };

  return (
    <div className="upload">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <FaPaperclip
        size={24}
        onClick={() => fileInputRef.current.click()}
        className="upload-icon"
      />
    </div>
  );
};

export default Upload;
