// src/components/Dashboard.jsx
import React from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PublicIcon from '@mui/icons-material/Public';
import ImageIcon from '@mui/icons-material/Image';

export default function Dashboard({ activeTab, onTabChange }) {
  return (
    <Paper elevation={3} sx={{ bgcolor: '#1e1e2f', mb: 4 }}>
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => onTabChange(newValue)}
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
      >
        <Tab
          icon={<RocketLaunchIcon />}
          label="NEO Dashboard"
          value="neo"
          sx={{ color: '#fff' }}
        />
        <Tab
          icon={<PublicIcon />}
          label="Mars Explorer"
          value="mars"
          sx={{ color: '#fff' }}
        />
        <Tab
          icon={<ImageIcon />}
          label="APOD Gallery"
          value="apod"
          sx={{ color: '#fff' }}
        />
      </Tabs>
    </Paper>
  );
}
