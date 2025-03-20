import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', { username, password });
            console.log(response.data); // Muestra el token o la respuesta exitosa
            navigate('/')
        } catch (error) {
            console.error('Error al iniciar sesión:', error.response || error.message); 
            alert('Error al iniciar sesión. Verifica los datos e intenta nuevamente.');
        }
    };

    return(
        <div>
            <h2>Iniciar Sesion</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type='text'
                    placeholder='Usuario'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type='password'
                    placeholder='Contraseña'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Iniciar sesión</button>
            </form>
        </div>
    )
}

export default Login