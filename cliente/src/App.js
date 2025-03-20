import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Libros from './components/Libros';
import CrearLibro from './components/crearLibros';
import Register from './components/Registro';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Libros />} />
          <Route path="/crear-libro" element={<CrearLibro />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
