import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './app.css';

const Libros = () => {
  const [libros, setLibros] = useState([]);
  const [ventas, setVentas] = useState({});
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    precio: '',
    anio_publicacion: '',
    editorial_id: '',
    autor: '',
    ventas: [] // Para manejar las ventas al crear o editar un libro
  });

  useEffect(() => {
    axios.get('http://localhost:5000/api/librosver')
      .then(response => {
        setLibros(response.data);
      })
      .catch(error => {
        console.error('Error al obtener los libros:', error);
      });
  }, []);

  const obtenerVentas = async (libroId) => {
    console.log('Obteniendo ventas para el libro con ID:', libroId);
    if (ventas[libroId]) {
      setVentas(prevVentas => {
        const updatedVentas = { ...prevVentas };
        delete updatedVentas[libroId];
        return updatedVentas;
      });
      return;
    }
  
    try {
      const response = await axios.get(`http://localhost:5000/api/ventas/libro/${libroId}`);
      console.log('Ventas obtenidas:', response.data);
      setVentas(prevVentas => ({ ...prevVentas, [libroId]: response.data }));
    } catch (error) {
      console.error('Error al obtener las ventas:', error.response?.data || error.message);
    }
  };

  const eliminarLibro = async (libroId) => {
    try {
      await axios.delete(`http://localhost:5000/api/libros/${libroId}`);
      setLibros(libros.filter(libro => libro.libro_id !== libroId));
    } catch (error) {
      console.error('Error al eliminar el libro:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleVentaChange = (index, e) => {
    const { name, value } = e.target;
    const newVentas = [...formData.ventas];
    newVentas[index] = { ...newVentas[index], [name]: value };
    setFormData({ ...formData, ventas: newVentas });
  };

  const agregarVenta = () => {
    setFormData({
      ...formData,
      ventas: [...formData.ventas, { cantidad: '', precio_venta: '', fecha_venta: '' }]
    });
  };

  const eliminarVenta = (index) => {
    const newVentas = formData.ventas.filter((_, i) => i !== index);
    setFormData({ ...formData, ventas: newVentas });
  };

  const iniciarEdicion = (libro) => {
    setEditando(libro.libro_id);
    setFormData({
      titulo: libro.titulo,
      precio: libro.precio,
      anio_publicacion: libro.anio_publicacion,
      editorial_id: libro.editorial_id || '',
      autor: libro.autor || '',
      ventas: libro.ventas || [], // Aquí manejamos las ventas del libro editado
    });
  };

  const modificarLibro = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/libros/${editando}`, {
        titulo: formData.titulo,
        precio: formData.precio,
        anio_publicacion: formData.anio_publicacion,
        editorial_id: formData.editorial_id,
        autor_nombre: formData.autor,
        ventas: formData.ventas, // Asegúrate de enviar las ventas también
      });
  
      // Actualizar las ventas en la interfaz de usuario
      setLibros(libros.map(libro =>
        libro.libro_id === editando ? { ...libro, ...formData } : libro
      ));
  
      // Recargar las ventas del libro editado
      obtenerVentas(editando);
  
      setEditando(null);
      setFormData({ titulo: '', precio: '', anio_publicacion: '', editorial_id: '', autor: '', ventas: [] });
    } catch (error) {
      console.error('Error al modificar el libro:', error);
    }
  };
    
  

  const crearLibro = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/libros', {
        titulo: formData.titulo,
        precio: formData.precio,
        anio_publicacion: formData.anio_publicacion,
        editorial_id: formData.editorial_id,
        autor_nombre: formData.autor,
        ventas: formData.ventas, // Enviar las ventas asociadas
      });

      setLibros([...libros, response.data]);

      setFormData({ titulo: '', precio: '', anio_publicacion: '', editorial_id: '', autor: '', ventas: [] });
    } catch (error) {
      console.error('Error al crear el libro:', error);
    }
  };

  return (
    <div>
      <h1>Libros</h1>
      <div>
        <Link to="/crear-libro" className="boton-crear">Crear Nuevo Libro</Link>
      </div>
      <div>
        <h2>Lista de Libros</h2>
        <ul>
          {libros.map((libro) => (
            <li key={libro.libro_id}>
              <div>
                <p><strong>Título:</strong> {libro.titulo}</p>
                <p><strong>Año de Publicación:</strong> {libro.anio_publicacion}</p>
                <p><strong>Precio:</strong> {libro.precio} €</p>
                <p><strong>Editorial:</strong> {libro.editorial || 'Sin Editorial'}</p>
                <p><strong>Autor:</strong> {libro.autor}</p>
              </div>
              <div className="botones">
                <button onClick={() => iniciarEdicion(libro)}>Modificar</button>
                <button onClick={() => eliminarLibro(libro.libro_id)}>Eliminar</button>
                <button onClick={() => obtenerVentas(libro.libro_id)}>Ver Ventas</button>
              </div>
              {ventas[libro.libro_id] && ventas[libro.libro_id].length > 0 ? (
                <div className="ventas">
                  <h3>Ventas:</h3>
                  <ul>
                    {ventas[libro.libro_id].map((venta, index) => (
                      <li key={index}>
                        <p><strong>Fecha:</strong> {venta.fecha_venta}</p>
                        <p><strong>Cantidad:</strong> {venta.cantidad}</p>
                        <p><strong>Precio de Venta:</strong> {venta.precio_venta} €</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : ventas[libro.libro_id] && ventas[libro.libro_id].length === 0 ? (
                <div className="no-ventas">
                  <p>No hay ventas registradas para este libro.</p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      {(editando || formData.titulo) && (
        <div>
          <h3>{editando ? 'Editar' : 'Crear'} Libro</h3>
          <form onSubmit={(e) => { e.preventDefault(); editando ? modificarLibro() : crearLibro(); }}>
            <div>
              <label>Título:</label>
              <input type="text" name="titulo" value={formData.titulo} onChange={handleInputChange} />
            </div>
            <div>
              <label>Precio:</label>
              <input type="number" name="precio" value={formData.precio} onChange={handleInputChange} />
            </div>
            <div>
              <label>Año de Publicación:</label>
              <input type="number" name="anio_publicacion" value={formData.anio_publicacion} onChange={handleInputChange} />
            </div>
            <div>
              <label>Editorial:</label>
              <input type="text" name="editorial_id" value={formData.editorial_id} onChange={handleInputChange} />
            </div>
            <div>
              <label>Autor:</label>
              <input type="text" name="autor" value={formData.autor} onChange={handleInputChange} />
            </div>
            <div>
              <h4>Ventas</h4>
              {formData.ventas.map((venta, index) => (
                <div key={index}>
                  <div>
                    <label>Cantidad:</label>
                    <input
                      type="number"
                      name="cantidad"
                      value={venta.cantidad}
                      onChange={(e) => handleVentaChange(index, e)}
                    />
                  </div>
                  <div>
                    <label>Precio de Venta:</label>
                    <input
                      type="number"
                      name="precio_venta"
                      value={venta.precio_venta}
                      onChange={(e) => handleVentaChange(index, e)}
                    />
                  </div>
                  <div>
                    <label>Fecha de Venta:</label>
                    <input
                      type="date"
                      name="fecha_venta"
                      value={venta.fecha_venta}
                      onChange={(e) => handleVentaChange(index, e)}
                    />
                  </div>
                  <button type="button" onClick={() => eliminarVenta(index)}>Eliminar Venta</button>
                </div>
              ))}
              <button type="button" onClick={agregarVenta}>Añadir Venta</button>
            </div>
            <div>
              <button type="submit">Guardar cambios</button>
              <button type="button" onClick={() => setEditando(null)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Libros;
