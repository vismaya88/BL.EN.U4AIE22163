import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:4000/api"
});

export const getAveragePrice = (ticker, minutes) =>
  api.get(`/stocks/${ticker}?minutes=${minutes}`);

export const getStockCorrelation = (ticker1, ticker2, minutes) =>
  api.get(`/stockcorrelation?ticker=${ticker1}&ticker=${ticker2}&minutes=${minutes}`);
