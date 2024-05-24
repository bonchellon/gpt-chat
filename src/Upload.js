import React, { useRef } from 'react';
import { FaPaperclip } from 'react-icons/fa';
import axios from 'axios';

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
    <div className="upload mr-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <FaPaperclip
        size={24}
        onClick={() => fileInputRef.current.click()}
        className="cursor-pointer text-blue-500 hover:text-blue-700"
      />
    </div>
  );
};

export default Upload;
