import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import WhiteboardRoom from './components/WhiteboardRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/room/:roomId" element={<WhiteboardRoom />} />
        {/* Optional: if you want RoomSelection directly */}
        {/* <Route path="/room-selection" element={<RoomSelection />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
