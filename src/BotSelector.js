import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BotSelector = ({ selectedBot, setSelectedBot }) => {
  const [bots, setBots] = useState(['gpt-4', 'llama']); // Изначально содержит 'gpt-4' и 'llama'
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    axios.get('/bots')
      .then(response => {
        const filteredBots = response.data.filter(bot => bot === 'gpt-3.5-turbo');
        setBots([...filteredBots, 'gpt-4', 'llama']);
        setError(false);
      })
      .catch(error => {
        console.error('Error fetching bots:', error);
        setError(true);
      });
  }, []);

  const handleBotChange = (e) => {
    const selected = e.target.value;
    setSelectedBot(selected);

    if (selected === 'gpt-4') {
      // Проверка работоспособности gpt-4
      axios.post('/check_bot', { bot: 'gpt-4' })
        .then(response => {
          if (!response.data.working) {
            setError(true);
            setErrorMessage('ChatGPT-4 не работает');
          } else {
            setError(false);
            setErrorMessage('');
          }
        })
        .catch(error => {
          console.error('Error checking gpt-4:', error);
          setError(true);
          setErrorMessage('ChatGPT-4 не работает');
        });
    } else {
      setError(false);
      setErrorMessage('');
    }
  };

  return (
    <div className="mb-4 text-center">
      <label className="block mb-2">Select Bot:</label>
      <select
        className={`p-2 border border-gray-300 rounded ${error ? 'error-select' : ''}`}
        value={selectedBot}
        onChange={handleBotChange}
      >
        {bots.map((bot) => (
          <option key={bot} value={bot}>
            {bot}
          </option>
        ))}
      </select>
      {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
    </div>
  );
};

export default BotSelector;
