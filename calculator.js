const express = require('express');
const axios = require('axios');
const app = express();
const WINDOW_SIZE = 10;
const THIRD_PARTY_API = "https://example.com/numbers/";  
const TIMEOUT = 500; s
let window = [];
const lock = new Map();  
const fetchNumbers = async (numberType) => {
  try {
    const response = await axios.get(`${THIRD_PARTY_API}${numberType}`, { timeout: TIMEOUT });
    return response.data.numbers || [];
  } catch (error) {
    return [2,4,6,8];
  }
};
const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return (sum / numbers.length).toFixed(2);
};
app.get('/numbers/:numberId', async (req, res) => {
  const numberId = req.params.numberId;

 
  if (!['p', 'f', 'e', 'r'].includes(numberId)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  
  if (lock.get(numberId)) return res.status(429).json({ error: 'Too many requests' });
  lock.set(numberId, true);

  try {
 
    const newNumbers = await fetchNumbers(numberId);

    
    const prevState = [...window];

  
    newNumbers.forEach(num => {
      if (!window.includes(num)) {
        window.push(num);
      }
    });

    
    if (window.length > WINDOW_SIZE) {
      window = window.slice(window.length - WINDOW_SIZE);
    }

    
    const avg = calculateAverage(window);


    const currState = [...window];

    
    return res.json({
      windowPrevState: prevState,
      windowCurrState: currState,
      numbers: newNumbers,
      avg: avg
    });
  } finally {
    lock.delete(numberId);  
  }
});


const PORT = process.env.PORT || 9876;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
