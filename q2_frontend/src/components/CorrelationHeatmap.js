import React, { useState, useEffect } from 'react';
import { getStockCorrelation } from '../services/api';
import { Box, Typography, TextField } from '@mui/material';

export default function CorrelationHeatmap() {
  const [ticker1, setTicker1] = useState('NVDA');
  const [ticker2, setTicker2] = useState('PYPL');
  const [minutes, setMinutes] = useState(30);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getStockCorrelation(ticker1, ticker2, minutes).then(res => setResult(res.data));
  }, [ticker1, ticker2, minutes]);

  return (
    <Box p={3}>
      <Typography variant="h4">Stock Correlation</Typography>
      <TextField label="Ticker 1" value={ticker1} onChange={e => setTicker1(e.target.value)} sx={{ m: 1 }} />
      <TextField label="Ticker 2" value={ticker2} onChange={e => setTicker2(e.target.value)} sx={{ m: 1 }} />
      <TextField label="Minutes" type="number" value={minutes} onChange={e => setMinutes(e.target.value)} sx={{ m: 1 }} />
      {result && (
        <Box>
          <Typography variant="h6">Correlation: {result.correlation.toFixed(4)}</Typography>
        </Box>
      )}
    </Box>
  );
}
