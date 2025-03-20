require('dotenv').config({ path: `.env.${process.env.NODE_ENV || "development"}` });
const express = require('express');
const cors = require('cors');  
const app = express();
const db = require('./db'); 
const rutasLibros = require('./routes/Libros'); 

app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  
    allowedHeaders: ['Content-Type', 'Authorization'], 
}));

app.use(express.json());

app.use('/api', rutasLibros(db));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
