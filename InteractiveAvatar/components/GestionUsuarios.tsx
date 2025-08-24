// Archivo: pages/crear-usuario.js
import { useState } from 'react';

const paises = [
  { nombre: 'Argentina', codigo: 'AR' },
  { nombre: 'Brasil', codigo: 'BR' },
  { nombre: 'Chile', codigo: 'CL' },
  { nombre: 'Colombia', codigo: 'CO' },
  { nombre: 'España', codigo: 'ES' },
  { nombre: 'Estados Unidos', codigo: 'US' },
  { nombre: 'México', codigo: 'MX' },
  { nombre: 'Perú', codigo: 'PE' },
  { nombre: 'Uruguay', codigo: 'UY' },
  { nombre: 'Venezuela', codigo: 'VE' },
];

const prefijos = [
  { nombre: '+54 (Argentina)', codigo: '+54' },
  { nombre: '+55 (Brasil)', codigo: '+55' },
  { nombre: '+56 (Chile)', codigo: '+56' },
  { nombre: '+57 (Colombia)', codigo: '+57' },
  { nombre: '+34 (España)', codigo: '+34' },
  { nombre: '+1 (Estados Unidos)', codigo: '+1' },
  { nombre: '+52 (México)', codigo: '+52' },
  { nombre: '+51 (Perú)', codigo: '+51' },
  { nombre: '+598 (Uruguay)', codigo: '+598' },
  { nombre: '+58 (Venezuela)', codigo: '+58' },
];

export default function CrearUsuario() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    pais: '',
    telefono: '',
    prefijo: '',
    usuario: '',
    contraseña: '',
  });

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const telefonoCompleto = `${formData.prefijo}${formData.telefono}`;
    const datos = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      pais: formData.pais,
      telefono: telefonoCompleto,
      usuario: formData.usuario,
      contraseña: formData.contraseña,
    };

    const response = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    const result = await response.json();
    alert(result.message);
  };

  return (
    <div>
      <h1>Crear Usuario</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />
        <input type="text" name="apellido" placeholder="Apellido" onChange={handleChange} required />
        <select name="pais" onChange={handleChange} required>
          <option value="">Seleccione un país</option>
          {paises.map((pais) => (
            <option key={pais.codigo} value={pais.nombre}>
              {pais.nombre}
            </option>
          ))}
        </select>
        <select name="prefijo" onChange={handleChange} required>
          <option value="">Seleccione un prefijo</option>
          {prefijos.map((prefijo) => (
            <option key={prefijo.codigo} value={prefijo.codigo}>
              {prefijo.nombre}
            </option>
          ))}
        </select>
        <input type="text" name="telefono" placeholder="Teléfono" onChange={handleChange} required />
        <input type="text" name="usuario" placeholder="Usuario" onChange={handleChange} required />
        <input type="password" name="contraseña" placeholder="Contraseña" onChange={handleChange} required />
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}
