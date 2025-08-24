// app/api/proxy-stocks/route.ts

export async function GET() {
  try {
    const res = await fetch("https://demo.fenicio.com.uy/API_V1/catalogo/stocks", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Remote API returned status ${res.status}`);
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);

    return new Response(JSON.stringify({ error: "Failed to fetch stock data" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
