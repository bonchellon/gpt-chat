import React, { useState } from 'react';
import BotSelector from './BotSelector';
import Chat from './Chat';
import './App.css';

const App = () => {
  const [selectedBot, setSelectedBot] = useState('gpt-3.5-turbo');

  return (
    <div className="App flex flex-col h-screen items-center p-4 bg-white">
      <div className="w-full max-w-2xl">
        <BotSelector selectedBot={selectedBot} setSelectedBot={setSelectedBot} />
      </div>
      <div className="flex-1 w-full max-w-2xl">
        <Chat selectedBot={selectedBot} />
      </div>
    </div>
  );
};

export default App;
