import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CrearLibro = () => {
  const [titulo, setTitulo] = useState('');
  const [anioPublicacion, setAnioPublicacion] = useState('');
  const [precio, setPrecio] = useState('');
  const [editorialId, setEditorialId] = useState('');
  const [nombreAutor, setNombreAutor] = useState('');


  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
         await axios.post('http://localhost:5000/api/libros', {
            titulo,
            anio_publicacion: anioPublicacion,
            precio,
            editorial_id: editorialId,
            nombre_autor: nombreAutor,
      });

      navigate('/');
    } catch (error) {
      console.error('Error al crear el libro:', error);
    }
  };

  return (
    <div>
      <h1>Crear Nuevo Libro</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Título:</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Año de Publicación:</label>
          <input
            type="number"
            value={anioPublicacion}
            onChange={(e) => setAnioPublicacion(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Precio:</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Editorial ID:</label>
          <input
            type="number"
            value={editorialId}
            onChange={(e) => setEditorialId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Nombre del Autor:</label>
          <input
            type="text"
            value={nombreAutor}
            onChange={(e) => setNombreAutor(e.target.value)}
            required
          />
        </div>
        <button type="submit">Crear Libro</button>
      </form>
    </div>
  );
};

export default CrearLibro;
