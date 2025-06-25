
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Stack } from '@mui/material';

const RoomSelection = () => {
  const navigate = useNavigate();

  const createRoom = (type) => {
    const roomId = Math.random().toString(36).substr(2, 9);
    navigate(`/room/${roomId}?type=${type}`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center',justifyContent :'center', marginLeft:70, mt: 10 }}>
      <Typography variant="h4" gutterBottom>
        Generate Your private Room id...
      </Typography>
      <Stack spacing={1} direction="row">
        <Button variant="contained" color="primary" onClick={() => createRoom('public')}>
          Create Public Room
        </Button>
      </Stack>
    </Box>
  );
};

export default RoomSelection;
