const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); 


exports.userRegister = async (req, res) => {
  const { username, password } = req.body;

  try {
      // Verificar si el usuario ya existe
      const [rows] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);

      if (rows.length > 0) {
          return res.status(400).json({ message: 'El usuario ya existe' });
      }

      // Cifrar la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insertar el nuevo usuario en la base de datos
      const [result] = await db.promise().query(
          'INSERT INTO users (username, password) VALUES (?, ?)', 
          [username, hashedPassword]
      );

      res.status(201).send('Usuario Registrado');
  } catch (error) {
      console.error('Error al registrar el usuario:', error); // Imprimir error completo
      res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
  }
};


exports.userLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ userID: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error en el inicio de sesión', error: error.message });
    }
};

