// src/App.jsx
import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Dashboard from './components/Dashboard';
import NEODashboard from './components/NEODashboard';
import MarsExplorer from './components/MarsExplorer';
import APODExplorer from './components/APODExplorer';

export default function App() {
  const [tab, setTab] = useState('neo');
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Dashboard activeTab={tab} onTabChange={setTab} />
      {tab === 'neo' && <NEODashboard />}
      {tab === 'mars' && <MarsExplorer />}
      {tab === 'apod' && <APODExplorer />}
    </Container>
  );
}
