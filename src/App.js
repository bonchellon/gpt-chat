import React, { useState } from 'react';
import BotSelector from './BotSelector';
import Chat from './Chat';
import './App.css';

const App = () => {
  // Устанавливаем LLAMA как бот по умолчанию
  const [selectedBot, setSelectedBot] = useState('llama');

  return (
    <div className="App flex flex-col h-screen items-center p-4 bg-white">
      <div className="w-full max-w-4xl"> {/* Увеличили max-w-2xl до max-w-4xl */}
        <BotSelector selectedBot={selectedBot} setSelectedBot={setSelectedBot} />
      </div>
      <div className="flex-1 w-full max-w-8xl"> {/* Увеличили max-w-2xl до max-w-4xl */}
        <Chat selectedBot={selectedBot} />
      </div>
    </div>
  );
};

export default App;
