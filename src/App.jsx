// ✅ App.jsx (Router) import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; import Room from './pages/Room';

export default function App() { return ( <Router> <Routes> <Route path="/room/:roomId" element={<Room />} /> </Routes> </Router> ); }

