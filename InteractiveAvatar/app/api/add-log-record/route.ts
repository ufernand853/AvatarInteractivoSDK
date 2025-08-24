import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const logFilePath = path.join(process.cwd(), "logs", "server.log");
    const logMessage = `[${new Date().toISOString()}] ${message}\n`;

    // Asegurar que la carpeta 'logs' exista
    await fs.promises.mkdir(path.dirname(logFilePath), { recursive: true });

    // Escribir en el archivo de log de forma asíncrona
    await fs.promises.appendFile(logFilePath, logMessage);

    return NextResponse.json({ success: true, message: "Log saved" }, { status: 200 });
  } catch (err) {
    console.error("Error writing to log file:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
