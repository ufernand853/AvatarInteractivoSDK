// src/UserList.js
import React, { useState, useEffect } from 'react';

function UserList() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/usuarios')
            .then(response => response.json())
            .then(data => setUsers(data));
    }, []);

    return (
        <div>
            <h2>Lista de Usuarios</h2>
            <ul>
                {users.map(user => (
                    <li key={user._id}>
                        {user.nombre} ({user.correo})
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserList;
