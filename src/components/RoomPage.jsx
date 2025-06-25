import React, { useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5100'); // backend port

const RoomPage = () => {
  const canvasRef = useRef(null);
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const roomType = searchParams.get('type');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let drawing = false;

    const startDraw = (e) => {
      drawing = true;
      ctx.beginPath();
      ctx.moveTo(e.clientX, e.clientY);
    };

    const draw = (e) => {
      if (!drawing) return;
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();

      // Emit drawing data
      socket.emit('draw', {
        roomId,
        x: e.clientX,
        y: e.clientY
      });
    };

    const stopDraw = () => {
      drawing = false;
      ctx.closePath();
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseout', stopDraw);

    // Join room
    socket.emit('join-room', { roomId, roomType });

    // Receive real-time drawing
    socket.on('draw', (data) => {
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    });

    return () => {
      socket.off('draw');
    };
  }, [roomId, roomType]);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
};

export default RoomPage;
