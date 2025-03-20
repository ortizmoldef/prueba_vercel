const express = require('express');
const router = express.Router();
const librosController = require('../controllers/controllers');
const UserController = require('../controllers/userController');

module.exports = (db) => {
    // Para ver los autores que hay
    router.get('/autores', librosController.getAutores);

    // Para que puedas ver todos los libros
    router.get('/librosver', librosController.getLibrosVer);
    
    // Da los libros con la ID del autor
    router.get('/libros/:autorId', librosController.getLibrosPorAutorYVentas); // Cambié esta línea para que coincida con la lógica de autor

    // Para que me de las ventas de libro por ID
    router.get('/ventas/libro/:libroId', librosController.getVentasLibroID); // Cambié esta ruta para diferenciarla de la venta por autor

    // Para obtener los libros por autor y las librerías donde se vendieron
    router.get('/ventas/autor/:autorId', librosController.getLibrosPorAutorYVentas); // Cambié esta ruta también para diferenciarla de la de libros

    // Para crear un libro
    router.post('/libros', librosController.postLibros);

    // Modificar los libros
    router.put('/libros/:id', librosController.putUpdateLibro);

    // Eliminar los Libros
    router.delete('/libros/:id', librosController.DeleteLibro);

    // Usuario de registro
    router.post('/register',UserController.userRegister)

    // Usuario de login
    router.post('/login', UserController.userLogin)
    return router; 
};
