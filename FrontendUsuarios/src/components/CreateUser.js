import React, { useState } from 'react';

function CreateUser() {
  const [nickname, setNickname] = useState('');
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [prefijo, setPrefijo] = useState('');
  const [pais, setPais] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname,
          nombre,
          direccion,
          telefono,
          prefijo,
          pais,
          correo,
          contraseña
        })
      });
      if (response.ok) {
        alert('✅ Usuario creado correctamente');
      } else {
        alert('❌ Error al crear usuario');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Error en el servidor');
    }
  };

  const formContainer = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '30px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  };

  const inputStyle = {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    marginBottom: '20px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontWeight: 'bold',
    marginBottom: '6px',
    display: 'block',
    color: '#333',
  };

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    fontSize: '18px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  };

  const headingStyle = {
    textAlign: 'center',
    fontSize: '24px',
    marginBottom: '30px',
    color: '#333',
  };

  return (
    <div style={formContainer}>
      <h2 style={headingStyle}>Crear Nuevo Usuario</h2>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Nickname:</label>
        <input style={inputStyle} type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} />

        <label style={labelStyle}>Nombre:</label>
        <input style={inputStyle} type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />

        <label style={labelStyle}>Dirección:</label>
        <input style={inputStyle} type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} />

        <label style={labelStyle}>Teléfono:</label>
        <input style={inputStyle} type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} />

        <label style={labelStyle}>Prefijo:</label>
        <input style={inputStyle} type="text" value={prefijo} onChange={(e) => setPrefijo(e.target.value)} />

        <label style={labelStyle}>País:</label>
        <input style={inputStyle} type="text" value={pais} onChange={(e) => setPais(e.target.value)} />

        <label style={labelStyle}>Correo:</label>
        <input style={inputStyle} type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />

        <label style={labelStyle}>Contraseña:</label>
        <input style={inputStyle} type="password" value={contraseña} onChange={(e) => setContraseña(e.target.value)} />

        <button style={buttonStyle} type="submit">✅ Crear Usuario</button>
      </form>
    </div>
  );
}

export default CreateUser;
