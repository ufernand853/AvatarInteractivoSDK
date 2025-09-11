import fs from "fs";
import path from "path";

interface LogsPageProps {
  searchParams: { patientId?: string };
}

export default function LogsPage({ searchParams }: LogsPageProps) {
  const logsDir = path.join(process.cwd(), "logs");
  const patientId = searchParams.patientId;

  if (patientId) {
    let content = "";
    try {
      content = fs.readFileSync(path.join(logsDir, `${patientId}.log`), "utf-8");
    } catch {
      content = "No logs for this patient.";
    }

    return (
      <div>
        <h1>Logs for {patientId}</h1>
        <pre>{content}</pre>
        <a href="/logs">Back</a>
      </div>
    );
  }

  const files = fs.existsSync(logsDir) ? fs.readdirSync(logsDir) : [];
  const patientIds = files
    .filter((f) => f.endsWith(".log"))
    .map((f) => path.basename(f, ".log"));

  return (
    <div>
      <h1>Patient Logs</h1>
      <ul>
        {patientIds.map((id) => (
          <li key={id}>
            <a href={`/logs?patientId=${id}`}>{id}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
