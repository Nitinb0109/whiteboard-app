import React, { useRef, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, Typography, Button, IconButton, TextField } from '@mui/material';
import { Undo, Redo, RadioButtonUnchecked, CropSquare, Clear, ModeEdit, Chat, Save, PictureAsPdf, ContentCopy } from '@mui/icons-material';
import socket from '../socket';
import { jsPDF } from 'jspdf';
import RoomFeatures from './RoomFeatures';

const WhiteboardRoom = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const roomType = searchParams.get('type');

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [actions, setActions] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const startX = useRef(0);
  const startY = useRef(0);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/room/${roomId}?type=${roomType}`;
    navigator.clipboard.writeText(link).then(() => {
      alert("Room link copied to clipboard!");
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    contextRef.current = ctx;
  }, []);

  useEffect(() => {
    const user = localStorage.getItem('username') || 'Guest';
    socket.emit('join-room', { roomId, user });

    socket.on('draw', drawFromSocket);
    socket.on('clear-canvas', clearCanvasLocal);
    socket.on('chat-message', (msg) => setChat((prev) => [...prev, msg]));

    return () => {
      socket.off('draw');
      socket.off('clear-canvas');
      socket.off('chat-message');
      socket.disconnect();
    };
  }, [roomId]);

  const drawFromSocket = ({ type, x0, y0, x1, y1, color }) => {
    const ctx = contextRef.current;
    ctx.strokeStyle = color || 'black';
    ctx.beginPath();
    if (type === 'line') {
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
    } else if (type === 'rect') {
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    } else if (type === 'circle') {
      const radius = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
      ctx.arc(x0, y0, radius, 0, 2 * Math.PI);
    }
    ctx.stroke();
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    startX.current = offsetX;
    startY.current = offsetY;
    const ctx = contextRef.current;
    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = contextRef.current;
    ctx.lineTo(offsetX, offsetY);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.stroke();

    const action = {
      tool,
      x0: startX.current,
      y0: startY.current,
      x1: offsetX,
      y1: offsetY,
      color: ctx.strokeStyle
    };

    setActions((prev) => [...prev, action]);
    socket.emit('draw', { roomId, type: 'line', ...action });

    startX.current = offsetX;
    startY.current = offsetY;
  };

  const finishDrawing = ({ nativeEvent }) => {
    setIsDrawing(false);
    const { offsetX, offsetY } = nativeEvent;
    const ctx = contextRef.current;
    ctx.strokeStyle = color;

    if (tool === 'rect') {
      ctx.strokeRect(startX.current, startY.current, offsetX - startX.current, offsetY - startY.current);
      socket.emit('draw', { roomId, type: 'rect', x0: startX.current, y0: startY.current, x1: offsetX, y1: offsetY, color });
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(offsetX - startX.current, 2) + Math.pow(offsetY - startY.current, 2));
      ctx.beginPath();
      ctx.arc(startX.current, startY.current, radius, 0, 2 * Math.PI);
      ctx.stroke();
      socket.emit('draw', { roomId, type: 'circle', x0: startX.current, y0: startY.current, x1: offsetX, y1: offsetY, color });
    }
  };

  const clearCanvasLocal = () => {
    const ctx = contextRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setActions([]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (actions.length === 0) return;
    const last = actions[actions.length - 1];
    setRedoStack((prev) => [...prev, last]);
    const newActions = actions.slice(0, -1);
    setActions(newActions);
    redrawCanvas(newActions);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack.pop();
    setActions((prev) => [...prev, next]);
    redrawCanvas([...actions, next]);
  };

  const redrawCanvas = (actionsList) => {
    const ctx = contextRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    actionsList.forEach(({ tool, x0, y0, x1, y1, color }) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      if (tool === 'pen') {
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
      } else if (tool === 'rect') {
        ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        ctx.arc(x0, y0, radius, 0, 2 * Math.PI);
      }
      ctx.stroke();
    });
  };

  const handleSaveImage = () => {
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handleSavePDF = () => {
    const pdf = new jsPDF();
    const imgData = canvasRef.current.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 100);
    pdf.save('whiteboard.pdf');
  };

  const handleChatSend = () => {
    socket.emit('chat-message', { roomId, message });
    setMessage('');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#ffffff' }}>
      <Box sx={{ flex: 1, p: 2, maxWidth: 'calc(100vw - 320px)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid black', pb: 1, mb: 2 }}>
          <Typography variant="h5">Room: {roomType}</Typography>
          <Button variant="text" startIcon={<ContentCopy />} onClick={handleCopyLink} sx={{ color: 'black', border: '1px solid black' }}>
            Copy Room Link
          </Button>
        </Box>

        <RoomFeatures roomId={roomId} />

        <Box sx={{ my: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <IconButton onClick={() => setTool('pen')}><ModeEdit /></IconButton>
          <IconButton onClick={() => setTool('eraser')}><Clear /></IconButton>
          <IconButton onClick={() => setTool('rect')}><CropSquare /></IconButton>
          <IconButton onClick={() => setTool('circle')}><RadioButtonUnchecked /></IconButton>
          <IconButton onClick={handleUndo}><Undo /></IconButton>
          <IconButton onClick={handleRedo}><Redo /></IconButton>
          <IconButton onClick={handleSaveImage}><Save /></IconButton>
          <IconButton onClick={handleSavePDF}><PictureAsPdf /></IconButton>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 40, height: 40, border: 'none' }} />
        </Box>

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={finishDrawing}
          onMouseLeave={finishDrawing}
          style={{ border: '1px solid #ccc', width: '100%', height: '50vh', backgroundColor: '#ffffff' }}
        />
      </Box>

      <Box sx={{ width: 300, p: 2, borderLeft: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>
        <Typography variant="h6"><Chat /> Chat</Typography>
        <Box sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', border: '1px solid #ccc', p: 1, mb: 1 }}>
          {chat.map((msg, idx) => (
            <Typography key={idx} variant="body2">{msg}</Typography>
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" value={message} onChange={(e) => setMessage(e.target.value)} fullWidth />
          <Button variant="contained" onClick={handleChatSend}>Send</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default WhiteboardRoom;
