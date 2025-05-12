const axios = require('axios');
require('dotenv').config();

let accessToken = null;

// Helper to calculate mean
const calculateMean = (prices) => prices.reduce((a, b) => a + b, 0) / prices.length;

// Helper to calculate covariance
const calculateCovariance = (X, Y, meanX, meanY) => {
  return X.reduce((sum, xi, i) => sum + (xi - meanX) * (Y[i] - meanY), 0) / (X.length - 1);
};

// Helper to calculate standard deviation
const calculateStdDev = (prices, mean) => Math.sqrt(prices.reduce((sum, xi) => sum + Math.pow(xi - mean, 2), 0) / (prices.length - 1));

// Authenticate to get the access token
const authenticate = async () => {
  if (accessToken) return accessToken;

  const response = await axios.post("http://20.244.56.144/evaluation-service/auth", {
    email: process.env.EMAIL,
    name: process.env.NAME,
    rollNo: process.env.ROLL_NO,
    accessCode: process.env.ACCESS_CODE,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  });

  accessToken = response.data.access_token;
  return accessToken;
};

// Fetch stock price history
const getPriceHistory = async (ticker, minutes) => {
  const token = await authenticate();
  const url = `http://20.244.56.144/evaluation-service/stocks/${ticker}?minutes=${minutes}`;
  const { data } = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

// Get average price of stock
const getAveragePrice = async (req, res) => {
  try {
    const { ticker } = req.params;
    const { minutes } = req.query;
    const data = await getPriceHistory(ticker, minutes);
    const prices = data.map(d => d.price);
    const avg = calculateMean(prices);
    res.json({ averageStockPrice: avg, priceHistory: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get correlation between two stock prices
const getStockCorrelation = async (req, res) => {
  try {
    const { minutes, ticker: tickers } = req.query;
    const [ticker1, ticker2] = Array.isArray(tickers) ? tickers : [tickers];

    const [data1, data2] = await Promise.all([
      getPriceHistory(ticker1, minutes),
      getPriceHistory(ticker2, minutes)
    ]);

    const prices1 = data1.map(p => p.price);
    const prices2 = data2.map(p => p.price);

    const minLength = Math.min(prices1.length, prices2.length);
    const X = prices1.slice(0, minLength);
    const Y = prices2.slice(0, minLength);

    const meanX = calculateMean(X);
    const meanY = calculateMean(Y);

    const covariance = calculateCovariance(X, Y, meanX, meanY);
    const stdX = calculateStdDev(X, meanX);
    const stdY = calculateStdDev(Y, meanY);

    const correlation = covariance / (stdX * stdY);

    res.json({
      correlation,
      stocks: {
        [ticker1]: {
          averagePrice: meanX,
          priceHistory: data1
        },
        [ticker2]: {
          averagePrice: meanY,
          priceHistory: data2
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAveragePrice,
  getStockCorrelation
};
