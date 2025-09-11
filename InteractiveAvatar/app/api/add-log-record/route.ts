import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { patientId, data } = await req.json();

    if (!patientId || !data) {
      return NextResponse.json(
        { error: "patientId and data are required" },
        { status: 400 }
      );
    }

    const logsDir = path.join(process.cwd(), "logs");
    const logFilePath = path.join(logsDir, `${patientId}.log`);
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...data,
    };

    await fs.promises.mkdir(logsDir, { recursive: true });
    await fs.promises.appendFile(logFilePath, JSON.stringify(logEntry) + "\n");

    return NextResponse.json(
      { success: true, message: "Log saved" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error writing to log file:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
