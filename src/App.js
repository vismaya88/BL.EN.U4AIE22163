import React from 'react';
import StockChart from './components/StockChart';
import CorrelationHeatmap from './components/CorrelationHeatmap';
import { Container, Tabs, Tab } from '@mui/material';

function App() {
  const [tab, setTab] = React.useState(0);
  return (
    <Container>
      <Tabs value={tab} onChange={(e, val) => setTab(val)}>
        <Tab label="Stock Page" />
        <Tab label="Correlation Heatmap" />
      </Tabs>
      {tab === 0 && <StockChart />}
      {tab === 1 && <CorrelationHeatmap />}
    </Container>
  );
}

export default App;
