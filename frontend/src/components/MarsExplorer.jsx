// src/components/MarsExplorer.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  MenuItem,
  Select,
  TextField,
  Button,
  CircularProgress,
  Dialog,
  DialogContent
} from '@mui/material';
import { fetchMarsRovers, fetchRoverPhotos } from '../api/nasaApi';

export default function MarsExplorer() {
  const [rovers, setRovers] = useState([]);
  const [selectedRover, setSelectedRover] = useState('perseverance');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ sol: '', camera: '', earth_date: '' });
  const [open, setOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);

  useEffect(() => {
    fetchMarsRovers().then((res) => setRovers(res.data.rovers));
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [selectedRover]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.sol) params.sol = filters.sol;
      if (filters.camera) params.camera = filters.camera;
      if (filters.earth_date) params.earth_date = filters.earth_date;

      const res = await fetchRoverPhotos(selectedRover, params);
      setPhotos(res.data.photos || res.data.latest_photos || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageClick = (photo) => {
    setCurrentPhoto(photo);
    setOpen(true);
  };

  return (
    <Box sx={{ color: '#fff' }}>
      <Typography variant="h5" mb={3}>Mars Rover Photo Explorer</Typography>

      {/* Filters */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={3}>
          <Select
            fullWidth
            variant="filled"
            value={selectedRover}
            onChange={(e) => setSelectedRover(e.target.value)}
            sx={{ color: '#fff' }}
          >
            {rovers.map((r) => (
              <MenuItem key={r.name} value={r.name.toLowerCase()}>{r.name}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Sol (Mars day)"
            variant="filled"
            value={filters.sol}
            onChange={(e) => handleChange('sol', e.target.value)}
            sx={{ input: { color: '#fff' }, label: { color: '#aaa' } }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Select
            fullWidth
            variant="filled"
            value={filters.camera}
            onChange={(e) => handleChange('camera', e.target.value)}
            displayEmpty
            sx={{ color: '#fff' }}
          >
            <MenuItem value="">All Cameras</MenuItem>
            <MenuItem value="FHAZ">Front Hazard Avoidance Camera</MenuItem>
            <MenuItem value="RHAZ">Rear Hazard Avoidance Camera</MenuItem>
            <MenuItem value="MAST">Mast Camera</MenuItem>
            <MenuItem value="NAVCAM">Navigation Camera</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            type="date"
            variant="filled"
            value={filters.earth_date}
            onChange={(e) => handleChange('earth_date', e.target.value)}
            sx={{ input: { color: '#fff' }, label: { color: '#aaa' } }}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <Box mb={2}>
        <Button variant="contained" onClick={loadPhotos}>Search</Button>
      </Box>

      {/* Gallery */}
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {photos.slice(0, 12).map((photo) => (
            <Grid item xs={12} sm={6} md={4} key={photo.id}>
              <Card sx={{ backgroundColor: '#1e1e2f', position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={photo.img_src}
                  alt={photo.camera.full_name}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleImageClick(photo)}
                />
                <Button
                  variant="outlined"
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  component="a"
                  href={photo.img_src}
                  download
                >Download</Button>
                <CardContent>
                  <Typography variant="body1" color="white">{photo.camera.full_name}</Typography>
                  <Typography variant="body2" color="gray">
                    {photo.rover.name} • {photo.earth_date}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Full-screen Dialog */}
      {currentPhoto && (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg">
          <DialogContent sx={{ bgcolor: '#000', p: 0 }}>
            <img
              src={currentPhoto.img_src}
              alt={currentPhoto.camera.full_name}
              style={{ width: '100%', height: 'auto' }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}
