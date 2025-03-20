const createTables = () => {
    const queries = [
      `CREATE TABLE IF NOT EXISTS Autores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        nacionalidad VARCHAR(100),
        fecha_nacimiento DATE
      );`,
      
      `CREATE TABLE IF NOT EXISTS Editoriales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        pais VARCHAR(100)
      );`,
      
      `CREATE TABLE IF NOT EXISTS Libros (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        anio_publicacion YEAR,
        editorial_id INT,
        precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
        FOREIGN KEY (editorial_id) REFERENCES Editoriales(id) ON DELETE SET NULL
      );`,
      
      `CREATE TABLE IF NOT EXISTS Libro_Autor (
        libro_id INT,
        autor_id INT,
        PRIMARY KEY (libro_id, autor_id),
        FOREIGN KEY (libro_id) REFERENCES Libros(id) ON DELETE CASCADE,
        FOREIGN KEY (autor_id) REFERENCES Autores(id) ON DELETE CASCADE
      );`,
      
      `CREATE TABLE IF NOT EXISTS Librerias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        direccion VARCHAR(255),
        telefono VARCHAR(20)
      );`,
      
      `CREATE TABLE IF NOT EXISTS Ventas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        libro_id INT,
        libreria_id INT,
        cantidad INT NOT NULL CHECK (cantidad > 0),
        precio_venta DECIMAL(10,2) NOT NULL CHECK (precio_venta >= 0),
        fecha_venta DATE NOT NULL,
        FOREIGN KEY (libro_id) REFERENCES Libros(id) ON DELETE CASCADE,
        FOREIGN KEY (libreria_id) REFERENCES Librerias(id) ON DELETE CASCADE
      );`
    ];
  
    queries.forEach(query => {
      db.query(query, (err) => {
        if (err) {
          console.error('Error al crear tablas:', err);
        }
      });
    });
  };
  
  module.export = createTables();
  