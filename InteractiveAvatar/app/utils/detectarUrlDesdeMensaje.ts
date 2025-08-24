export const detectarUrlDesdeMensaje = async (mensaje: string): Promise<string | null> => {
    try {
      const response = await fetch("/api/generar-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mensaje }),
      });
  
      if (!response.ok) {
        console.error("Error en la respuesta:", response.status);
        return null;
      }
  
      const data = await response.json();
      return data.url || null;
    } catch (err) {
      console.error("Error al hacer fetch a /api/generar-url:", err);
      return null;
    }
  };
  