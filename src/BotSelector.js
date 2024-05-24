import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BotSelector = ({ selectedBot, setSelectedBot }) => {
  const [bots, setBots] = useState([]);

  useEffect(() => {
    axios.get('/bots')
      .then(response => setBots(response.data))
      .catch(error => console.error('Error fetching bots:', error));
  }, []);

  return (
    <div className="mb-4 text-center">
      <label className="block mb-2">Select Bot:</label>
      <select
        className="p-2 border border-gray-300 rounded"
        value={selectedBot}
        onChange={(e) => setSelectedBot(e.target.value)}
      >
        {bots.map((bot) => (
          <option key={bot} value={bot}>
            {bot}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BotSelector;
