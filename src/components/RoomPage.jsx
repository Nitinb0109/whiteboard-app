import React, { useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE_URL); // ✅ Correct usage

const RoomPage = () => {
  const canvasRef = useRef(null);
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const roomType = searchParams.get('type');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.lineCap = 'round';

    let drawing = false;

    const getPosition = (e) => {
      return { x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop };
    };

    const startDraw = (e) => {
      drawing = true;
      const { x, y } = getPosition(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (e) => {
      if (!drawing) return;
      const { x, y } = getPosition(e);
      ctx.lineTo(x, y);
      ctx.stroke();

      socket.emit('draw', { roomId, x, y });
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

    // Receive draw data
    socket.on('draw', ({ x, y }) => {
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // Cleanup
    return () => {
      socket.off('draw');
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDraw);
      canvas.removeEventListener('mouseout', stopDraw);
    };
  }, [roomId, roomType]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100vw',
        height: '100vh',
        cursor: 'crosshair'
      }}
    />
  );
};

export default RoomPage;
