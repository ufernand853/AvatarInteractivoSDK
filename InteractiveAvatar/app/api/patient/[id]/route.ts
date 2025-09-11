import { NextResponse } from "next/server";
import mongoose, { Schema, models, model } from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/avatar";

const PatientSchema = new Schema({
  nombre: String,
  edad: Number,
  antecedentes: String,
  preferencias: String,
});

const Patient = models.Patient || model("Patient", PatientSchema);

async function connect() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  await connect();
  if (params.id === "all") {
    const patients = await Patient.find().lean();

    return NextResponse.json(patients);
  }
  const patient = await Patient.findById(params.id).lean();

  if (!patient) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(patient);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  await connect();
  if (params.id === "all") {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const data = await req.json();
  const patient = await Patient.findByIdAndUpdate(params.id, data, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  return NextResponse.json(patient);
}
