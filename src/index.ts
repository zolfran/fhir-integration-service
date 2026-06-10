import express from "express";
import { patientRouter } from "./routes/patient.js";
import { observationRouter } from "./routes/observation.js";
import { transformRouter } from "./routes/transform.js";
import { capabilityRouter } from "./routes/capability.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(express.json());

// FHIR metadata / capability statement
app.use("/metadata", capabilityRouter);

// FHIR R4 resource endpoints
app.use("/Patient", patientRouter);
app.use("/Observation", observationRouter);

// HL7v2 → FHIR transformation endpoint
app.use("/transform", transformRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "healthy", service: "fhir-integration-service", version: "1.0.0" });
});

app.listen(PORT, () => {
  console.log(`FHIR Integration Service running on port ${PORT}`);
  console.log(`FHIR metadata: http://localhost:${PORT}/metadata`);
  console.log(`Swagger: http://localhost:${PORT}/health`);
});

export default app;
