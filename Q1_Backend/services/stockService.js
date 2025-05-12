const axios = require('axios');
require('dotenv').config();

let accessToken = null;

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

const getPriceHistory = async (ticker, minutes) => {
  const token = await authenticate();
  const url = `http://20.244.56.144/evaluation-service/stocks/${ticker}?minutes=${minutes}`;
  const { data } = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const getAveragePrice = async (req, res) => {
  try {
    const { ticker } = req.params;
    const { minutes } = req.query;
    const data = await getPriceHistory(ticker, minutes);
    const prices = data.map(d => d.price);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    res.json({ averageStockPrice: avg, priceHistory: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

    const meanX = X.reduce((a, b) => a + b, 0) / X.length;
    const meanY = Y.reduce((a, b) => a + b, 0) / Y.length;

    const covariance = X.reduce((sum, xi, i) => sum + (xi - meanX) * (Y[i] - meanY), 0) / (X.length - 1);
    const stdX = Math.sqrt(X.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0) / (X.length - 1));
    const stdY = Math.sqrt(Y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0) / (Y.length - 1));

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
