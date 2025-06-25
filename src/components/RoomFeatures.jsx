import React, { useEffect, useState } from 'react';
import { Box, Typography, Switch, FormControlLabel, List, ListItem, ListItemText } from '@mui/material';
import socket from '../socket';

const RoomFeatures = ({ roomId }) => {
  const [users, setUsers] = useState([]);
  const [isEditor, setIsEditor] = useState(true);

  useEffect(() => {
    socket.emit('get-users', roomId);

    socket.on('room-users', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off('room-users');
    };
  }, [roomId]);

  const handleRoleToggle = () => {
    const newRole = !isEditor;
    setIsEditor(newRole);
    socket.emit('change-role', { roomId, role: newRole ? 'editor' : 'viewer' });
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #888', borderRadius: 2, backgroundColor: '#222' }}>
      <Typography variant="h6" sx={{ color: '#fff' }}>Room Settings</Typography>
      <FormControlLabel
        control={<Switch checked={isEditor} onChange={handleRoleToggle} color="primary" />}
        label={isEditor ? 'Editor Mode' : 'View-Only Mode'}
        sx={{ color: '#fff' }}
      />

      <Typography variant="body1" sx={{ mt: 2, color: '#fff' }}>Users in Room:</Typography>
      <List dense sx={{ color: '#fff' }}>
        {users.map((user, idx) => (
          <ListItem key={idx}>
            <ListItemText primary={user.name} secondary={user.role} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default RoomFeatures;
