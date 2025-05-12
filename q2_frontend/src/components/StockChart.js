import React, { useState, useEffect } from 'react';
import { getAveragePrice } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Box, TextField, Typography } from '@mui/material';

export default function StockChart() {
  const [data, setData] = useState([]);
  const [avg, setAvg] = useState(0);
  const [ticker, setTicker] = useState('NVDA');
  const [minutes, setMinutes] = useState(30);

  useEffect(() => {
    getAveragePrice(ticker, minutes).then(res => {
      setData(res.data.priceHistory);
      setAvg(res.data.averageStockPrice);
    });
  }, [ticker, minutes]);

  return (
    <Box p={3}>
      <Typography variant="h4">Stock Price for {ticker}</Typography>
      <TextField label="Ticker" value={ticker} onChange={e => setTicker(e.target.value)} sx={{ m: 1 }} />
      <TextField label="Minutes" type="number" value={minutes} onChange={e => setMinutes(e.target.value)} sx={{ m: 1 }} />
      <LineChart width={800} height={400} data={data}>
        <XAxis dataKey="lastUpdatedAt" hide />
        <YAxis />
        <CartesianGrid stroke="#ccc" />
        <Tooltip />
        <Line type="monotone" dataKey="price" stroke="#1976d2" />
        <ReferenceLine y={avg} stroke="red" strokeDasharray="3 3" label="Avg" />
      </LineChart>
    </Box>
  );
}
