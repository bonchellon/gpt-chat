import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BotSelector = ({ selectedBot, setSelectedBot }) => {
  const [bots, setBots] = useState(['llama']); // Изначально содержит 'llama'
  const [error, setError] = useState(false);

  useEffect(() => {
    axios.get('/bots')
      .then(response => {
        const filteredBots = response.data.filter(bot => 
          bot === 'gpt-3.5-turbo' || bot === 'gpt-4'
        );
        setBots([...filteredBots, 'llama']);
        setError(false);
      })
      .catch(error => {
        console.error('Error fetching bots:', error);
        setError(true);
      });
  }, []);

  return (
    <div className="mb-4 text-center">
      <label className="block mb-2">Select Bot:</label>
      <select
        className={`p-2 border border-gray-300 rounded ${error ? 'error-select' : ''}`}
        value={selectedBot}
        onChange={(e) => setSelectedBot(e.target.value)}
      >
        {bots.map((bot) => (
          <option key={bot} value={bot}>
            {bot}
          </option>
        ))}
      </select>
      {error && <div className="text-red-500 mt-2">Error fetching GPT models. Defaulting to LLAMA.</div>}
    </div>
  );
};

export default BotSelector;
