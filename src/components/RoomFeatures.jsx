import React, { useEffect, useState } from 'react';
import { Box, Typography, Switch, FormControlLabel, List, ListItem, ListItemText } from '@mui/material';
import socket from '../socket';

const RoomFeatures = ({ roomId }) => {
  const [users, setUsers] = useState([]);
  const [isEditor, setIsEditor] = useState(true);

  useEffect(() => {
    socket.emit('get-users', roomId);

    const handleUsersUpdate = (userList) => {
      setUsers(userList);
    };

    socket.on('room-users', handleUsersUpdate);

    return () => {
      socket.off('room-users', handleUsersUpdate);
    };
  }, [roomId]);

  const handleRoleToggle = () => {
    const newRole = !isEditor;
    setIsEditor(newRole);
    socket.emit('change-role', { roomId, role: newRole ? 'editor' : 'viewer' });
  };

  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid #888',
        borderRadius: 2,
        backgroundColor: '#1e1e1e',
        color: '#fff',
        mt: 2
      }}
    >
      <Typography variant="h6">Room Settings</Typography>

      <FormControlLabel
        control={
          <Switch
            checked={isEditor}
            onChange={handleRoleToggle}
            color="primary"
          />
        }
        label={isEditor ? 'Editor Mode' : 'View-Only Mode'}
      />

      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Users in Room:
      </Typography>
      <List dense>
        {users.map((user) => (
          <ListItem key={user.id}>
            <ListItemText
              primary={user.name}
              secondary={`Role: ${user.role}`}
              primaryTypographyProps={{ color: '#fff' }}
              secondaryTypographyProps={{ color: 'gray' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default RoomFeatures;
