export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch("http://localhost:5000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status });
  } catch (error) {
    console.error("Error forwarding order:", error);
    return new Response("Error creating order", { status: 500 });
  }
}
