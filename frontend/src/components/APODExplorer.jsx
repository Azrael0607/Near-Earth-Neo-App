// src/components/APODExplorer.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogContent
} from '@mui/material';
import { fetchAPOD } from '../api/nasaApi';

export default function APODExplorer() {
  const [apod, setApod] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchAPODData();
  }, []);

  const fetchAPODData = async (date = null) => {
    setLoading(true);
    try {
      // Use `random` param for random APODs
      const params = date === 'random' ? { random: true } : date ? { date } : {};
      const response = await fetchAPOD(params);
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      setApod(data);
      if (date === 'random') setSelectedDate(''); 
    } catch (error) {
      console.error('Error fetching APOD:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchAPODData(date);
  };

  const fetchRandomAPOD = () => {
    fetchAPODData('random');
  };

  return (
    <Box sx={{ color: '#fff' }}>
      <Typography variant="h5" mb={3}>Astronomy Picture of the Day</Typography>

      {/* Controls */}
      <Box display="flex" gap={2} mb={4}>
        <TextField
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          variant="filled"
          InputLabelProps={{ shrink: true }}
          sx={{ input: { color: '#fff' }, label: { color: '#aaa' } }}
        />
        <Button variant="contained" color="secondary" onClick={fetchRandomAPOD}>
          Random
        </Button>
        <Button variant="contained" color="primary" onClick={() => fetchAPODData()}>
          Today
        </Button>
      </Box>

      {/* Loading State */}
      {loading ? (
        <CircularProgress />
      ) : apod ? (
        <>
          <Card sx={{ backgroundColor: '#1e1e2f', position: 'relative' }}>
            <CardContent>
              <Typography variant="h6" color="white">{apod.title}</Typography>
              <Typography variant="subtitle2" color="gray">{apod.date}</Typography>
            </CardContent>

            {apod.media_type === 'image' ? (
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  image={apod.hdurl || apod.url}
                  alt={apod.title}
                  sx={{
                    maxHeight: 500,
                    objectFit: 'contain',
                    backgroundColor: '#000',
                    cursor: 'pointer'
                  }}
                  onClick={() => setOpen(true)}
                />
                <Button
                  variant="outlined"
                  sx={{ position: 'absolute', top: 16, right: 16 }}
                  component="a"
                  href={apod.hdurl || apod.url}
                  download
                >
                  Download
                </Button>
              </Box>
            ) : (
              <Box p={2}>
                <iframe
                  src={apod.url}
                  title={apod.title}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  allowFullScreen
                />
              </Box>
            )}

            <CardContent>
              <Typography variant="body2" color="white">{apod.explanation}</Typography>
            </CardContent>
          </Card>

          {/* Full‑screen Dialog */}
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            fullWidth
            maxWidth="lg"
          >
            <DialogContent sx={{ bgcolor: '#000', p: 0 }}>
              <img
                src={apod.hdurl || apod.url}
                alt={apod.title}
                style={{ width: '100%', height: 'auto' }}
              />
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Typography>No data available</Typography>
      )}
    </Box>
);
}
