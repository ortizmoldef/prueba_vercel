const db = require('../db');

// Función común para manejar errores
function handleError(res, error, message = 'Error en el servidor') {
    console.error(error);
    res.status(500).send(message);
}

exports.getAutores = (req, res) => {  
  const query = 'SELECT * FROM Autores';
  db.query(query, (err, results) => {
      if (err) return handleError(res, err, 'Error al obtener autores');
      res.json(results); 
  });
};

// Obtener libros con información detallada
exports.getLibrosVer = (req, res) => { 
  const query = `
    SELECT 
        l.id AS libro_id, 
        l.titulo, 
        l.anio_publicacion, 
        l.precio, 
        e.nombre AS editorial, 
        a.nombre AS autor,
        v.cantidad AS cantidad_vendida,
        v.precio_venta AS precio_venta,
        v.fecha_venta AS fecha_venta
    FROM Libros l
    LEFT JOIN Editoriales e ON l.editorial_id = e.id
    JOIN Libro_Autor la ON l.id = la.libro_id
    JOIN Autores a ON la.autor_id = a.id
    LEFT JOIN Ventas v ON l.id = v.libro_id
  `;

  db.query(query, (err, results) => {
    if (err) return handleError(res, err, 'Error al obtener libros');
    res.json(results);  
  });
};


// Crear libro con autor y editorial
exports.postLibros = (req, res) => {
  const { titulo, anio_publicacion, precio, editorial_id, nombre_autor } = req.body;

  let editorialId = editorial_id;

  const crearRelacionLibroAutor = (libroId, autorNombre) => {
    const queryAutor = 'SELECT id FROM Autores WHERE nombre = ?';
    db.query(queryAutor, [autorNombre], (err, autorResults) => {
      if (err) return handleError(res, err, 'Error al obtener el autor');

      if (autorResults.length === 0) {
        const queryNuevoAutor = 'INSERT INTO Autores (nombre) VALUES (?)';
        db.query(queryNuevoAutor, [autorNombre], (err, nuevoAutorResults) => {
          if (err) return handleError(res, err, 'Error al crear el autor');
          
          const queryRelacion = 'INSERT INTO Libro_Autor (libro_id, autor_id) VALUES (?, ?)';
          db.query(queryRelacion, [libroId, nuevoAutorResults.insertId], (err) => {
            if (err) return handleError(res, err, 'Error al relacionar libro con autor');
            res.status(201).send('Libro creado con éxito');
          });
        });
      } else {
        const queryRelacion = 'INSERT INTO Libro_Autor (libro_id, autor_id) VALUES (?, ?)';
        db.query(queryRelacion, [libroId, autorResults[0].id], (err) => {
          if (err) return handleError(res, err, 'Error al relacionar libro con autor');
          res.status(201).send('Libro creado con éxito');
        });
      }
    });
  };

  if (!editorialId) {
    const queryEditorial = 'INSERT INTO Editoriales (nombre) VALUES (?)';
    db.query(queryEditorial, ['Nueva Editorial'], (err, editorialResults) => {
      if (err) return handleError(res, err, 'Error al crear la editorial');
      
      editorialId = editorialResults.insertId;
      const queryLibro = 'INSERT INTO Libros (titulo, anio_publicacion, precio, editorial_id) VALUES (?, ?, ?, ?)';
      
      db.query(queryLibro, [titulo, anio_publicacion, precio, editorialId], (err, libroResults) => {
        if (err) return handleError(res, err, 'Error al crear el libro');
        
        if (nombre_autor) {
          crearRelacionLibroAutor(libroResults.insertId, nombre_autor);
        } else {
          res.status(201).send('Libro creado con éxito y nueva editorial asociada');
        }
      });
    });
  } else {
    const queryLibro = 'INSERT INTO Libros (titulo, anio_publicacion, precio, editorial_id) VALUES (?, ?, ?, ?)';
    db.query(queryLibro, [titulo, anio_publicacion, precio, editorialId], (err, libroResults) => {
      if (err) return handleError(res, err, 'Error al crear el libro');
      
      if (nombre_autor) {
        crearRelacionLibroAutor(libroResults.insertId, nombre_autor);
      } else {
        res.status(201).send('Libro creado con éxito');
      }
    });
  }
};

// Eliminar los libros
exports.DeleteLibro = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Libros WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return handleError(res, err, 'Error al eliminar el libro');
        res.status(200).send('Libro eliminado correctamente');
    });
};

// Obtener ventas de libro por ID
exports.getVentasLibroID = (req, res) => {
  const libroId = req.params.libroId;

  if (!libroId) {
    return res.status(400).send('ID de libro no válido');
  }

  const query = 'SELECT * FROM ventas WHERE libro_id = ?';
  db.query(query, [libroId], (error, results) => {
    if (error) {
      console.error('Error al obtener las ventas:', error);
      return res.status(500).send('Error en el servidor');
    }

    res.json(results);
  });
};

// Obtener libros con ventas por autor
exports.getLibrosPorAutorYVentas = (req, res) => {
  const { autorId } = req.params;
  const query = `
      SELECT 
          a.nombre AS autor,
          l.titulo AS libro,
          l.anio_publicacion AS anio_publicacion,
          l.precio AS precio,
          li.nombre AS libreria,
          v.fecha_venta AS fecha_venta,
          v.cantidad AS cantidad_vendida,
          v.precio_venta AS precio_venta
      FROM 
          Autores a
      JOIN 
          Libro_Autor la ON a.id = la.autor_id
      JOIN 
          Libros l ON la.libro_id = l.id
      JOIN 
          Ventas v ON l.id = v.libro_id
      JOIN 
          Librerias li ON v.libreria_id = li.id
      WHERE 
          a.id = ?;
  `;
  
  db.query(query, [autorId], (err, results) => {
      if (err) return handleError(res, err, 'Error al obtener los libros y ventas');
      if (results.length === 0) {
          return res.status(404).send('No se encontraron libros ni ventas para este autor');
      }
      res.json(results);
  });
};

// Actualizar libro y autor
exports.putUpdateLibro = (req, res) => {
  const { id } = req.params;
  const { titulo, anio_publicacion, precio, editorial_id, autor_nombre } = req.body;

  const validEditorialId = editorial_id ? editorial_id : null;

  const query = `
      UPDATE Libros
      SET titulo = ?, anio_publicacion = ?, precio = ?, editorial_id = ?
      WHERE id = ?
  `;
  
  db.query(query, [titulo, anio_publicacion, precio, validEditorialId, id], (err, result) => {
      if (err) return handleError(res, err, 'Error al actualizar el libro');
      if (result.affectedRows === 0) {
          return res.status(404).send('Libro no encontrado');
      }

      if (autor_nombre) {
          const queryAutor = 'SELECT a.id FROM Autores a JOIN Libro_Autor la ON a.id = la.autor_id WHERE la.libro_id = ?';
          db.query(queryAutor, [id], (err, autorResults) => {
              if (err) return handleError(res, err, 'Error al obtener autor actual');

              if (autorResults.length > 0) {
                  const autorId = autorResults[0].id;
                  if (autorId) {
                      const queryUpdateAutor = 'UPDATE Autores SET nombre = ? WHERE id = ?';
                      db.query(queryUpdateAutor, [autor_nombre, autorId], (err) => {
                          if (err) return handleError(res, err, 'Error al actualizar el autor');
                          
                          const queryActualizarRelacion = 'UPDATE Libro_Autor SET autor_id = ? WHERE libro_id = ?';
                          db.query(queryActualizarRelacion, [autorId, id], (err) => {
                              if (err) return handleError(res, err, 'Error al actualizar la relación libro-autor');
                              res.send('Libro y autor actualizados con éxito');
                          });
                      });
                  }
              } else {
                  return res.status(404).send('Autor no encontrado en la relación');
              }
          });
      } else {
          res.send('Libro actualizado con éxito');
      }
  });
};

