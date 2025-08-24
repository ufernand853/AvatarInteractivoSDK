// src/UserDetails.js
import React, { useState, useEffect } from 'react';

function UserDetails({ userId }) {
    const [user, setUser] = useState({});

    useEffect(() => {
        fetch(`http://localhost:5000/usuarios/${userId}`)
            .then(response => response.json())
            .then(data => setUser(data));
    }, [userId]);

    return (
        <div>
            <h2>Detalles del Usuario</h2>
            <p>Nombre: {user.nombre}</p>
            <p>Correo: {user.correo}</p>
            <p>Dirección: {user.direccion}</p>
            <p>Teléfono: {user.telefono}</p>
        </div>
    );
}

export default UserDetails;
