"use client";

import { useState, useEffect } from "react";

interface Patient {
  _id: string;
  nombre: string;
  edad: number;
  antecedentes: string;
  preferencias: string;
}

export default function PatientConfigPage() {
  const [form, setForm] = useState({
    nombre: "",
    edad: "",
    antecedentes: "",
    preferencias: "",
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/patient/all");

      if (res.ok) {
        const data = await res.json();

        setPatients(data);
      }
    } catch (_err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now().toString();

    await fetch(`/api/patient/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.nombre,
        edad: Number(form.edad),
        antecedentes: form.antecedentes,
        preferencias: form.preferencias,
      }),
    });
    setForm({ nombre: "", edad: "", antecedentes: "", preferencias: "" });
    fetchPatients();
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input
          required
          className="border p-2"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
        />
        <input
          required
          className="border p-2"
          name="edad"
          placeholder="Edad"
          type="number"
          value={form.edad}
          onChange={handleChange}
        />
        <textarea
          className="border p-2"
          name="antecedentes"
          placeholder="Antecedentes"
          value={form.antecedentes}
          onChange={handleChange}
        />
        <textarea
          className="border p-2"
          name="preferencias"
          placeholder="Preferencias"
          value={form.preferencias}
          onChange={handleChange}
        />
        <button className="bg-blue-500 text-white p-2 mt-2" type="submit">
          Guardar
        </button>
      </form>

      <h2 className="mt-6 font-bold">Pacientes</h2>
      <ul className="mt-2 space-y-1">
        {patients.map((p) => (
          <li key={p._id}>
            <button
              className={`w-full text-left p-2 border ${
                selected === p._id ? "bg-blue-100" : ""
              }`}
              type="button"
              onClick={() => setSelected(p._id)}
            >
              {p.nombre} ({p.edad})
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
