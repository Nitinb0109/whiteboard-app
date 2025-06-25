import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Stack } from '@mui/material';

const RoomSelection = () => {
  const navigate = useNavigate();

  const createRoom = (type) => {
    // Generate a random 9-character room ID
    const roomId = Math.random().toString(36).slice(2, 11);
    navigate(`/room/${roomId}?type=${type}`);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        mt: 10,
        px: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Generate Your Private Room ID
      </Typography>
      <Stack spacing={2} direction="row" sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={() => createRoom('public')}>
          Create Public Room
        </Button>
      </Stack>
    </Box>
  );
};

export default RoomSelection;
