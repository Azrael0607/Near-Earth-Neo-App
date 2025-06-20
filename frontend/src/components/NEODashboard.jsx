// src/components/NEODashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LineChart } from '@mui/x-charts';
import { fetchNEOFeed, fetchNEOStats } from '../api/nasaApi';

const getDangerLevel = (obj) => {
  if (obj.is_potentially_hazardous && obj.miss_distance_km < 7500000) return 'HIGH';
  if (obj.is_potentially_hazardous) return 'MEDIUM';
  return 'LOW';
};

const getDangerColor = (level) => {
  switch (level) {
    case 'HIGH': return 'error';
    case 'MEDIUM': return 'warning';
    default: return 'success';
  }
};

const formatDistance = (km) => (km > 1000000 ? `${(km / 1e6).toFixed(2)}M km` : `${km.toLocaleString()} km`);
const formatVelocity = (kmh) => `${kmh.toLocaleString()} km/h`;

export default function NEODashboard() {
  const [neoData, setNeoData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feedRes, statsRes] = await Promise.all([
        fetchNEOFeed(),
        fetchNEOStats()
      ]);
      setNeoData(feedRes.data.near_earth_objects);
      setAlerts(feedRes.data.alerts);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load NEO data', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNEOs = neoData.filter((obj) =>
    obj.name.toLowerCase().includes(search.toLowerCase())
  );

  const velocityChartData = filteredNEOs.slice(0, 15).map((n) => ({
    name: n.name,
    velocity: n.relative_velocity_kmh
  }));

  return (
    <Box sx={{ color: '#fff' }}>
      {loading && <LinearProgress />}

      {/* Summary Cards */}
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#1e1e2f' }}>
            <CardContent>
              <Typography variant="subtitle2">Total NEOs Tracked</Typography>
              <Typography variant="h4">{stats.near_earth_object_count?.toLocaleString() || '...'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#2d1e2f' }}>
            <CardContent>
              <Typography variant="subtitle2">Current Alerts</Typography>
              <Typography variant="h4" color="error.main">{alerts.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#1e2f2f' }}>
            <CardContent>
              <Typography variant="subtitle2">Objects Today</Typography>
              <Typography variant="h4">{neoData.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#2f2f1e' }}>
            <CardContent>
              <Typography variant="subtitle2">Potentially Hazardous</Typography>
              <Typography variant="h4" color="warning.main">
                {neoData.filter((o) => o.is_potentially_hazardous).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Filter */}
      <Box mt={4}>
        <TextField
          label="Search Asteroids"
          variant="filled"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ input: { color: '#fff' }, label: { color: '#aaa' } }}
        />
      </Box>

      {/* Velocity Trend Chart */}
      <Box mt={5}>
        <Typography variant="h6" gutterBottom>Asteroid Velocity Trends</Typography>
        <LineChart
          height={300}
          series={[{ data: velocityChartData.map(d => d.velocity), label: 'Velocity (km/h)' }]}
          xAxis={[{ scaleType: 'point', data: velocityChartData.map(d => d.name) }]}
          sx={{ backgroundColor: '#1e1e2f', borderRadius: 2 }}
        />
      </Box>

      {/* NEO Details */}
      <Box mt={5}>
        <Typography variant="h6" gutterBottom>Near-Earth Object List</Typography>
        {filteredNEOs.slice(0, 20).map((obj, i) => (
          <Accordion key={obj.id} sx={{ bgcolor: '#2e2e3e', color: '#fff' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}><Typography>{obj.name}</Typography></Grid>
                <Grid item xs={6} textAlign="right">
                  <Chip
                    label={getDangerLevel(obj)}
                    color={getDangerColor(getDangerLevel(obj))}
                    size="small"
                  />
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={6}>Diameter: {obj.estimated_diameter_min.toFixed(2)}–{obj.estimated_diameter_max.toFixed(2)} km</Grid>
                <Grid item xs={6}>Velocity: {formatVelocity(obj.relative_velocity_kmh)}</Grid>
                <Grid item xs={6}>Miss Distance: {formatDistance(obj.miss_distance_km)}</Grid>
                <Grid item xs={6}>Approach Date: {obj.close_approach_date}</Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}