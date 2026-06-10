import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import type { FHIRObservation, FHIRBundle } from "../models/fhir-types.js";

export const observationRouter = Router();

// In-memory store
const observations = new Map<string, FHIRObservation>();

// Seed sample observations
const seedObs: FHIRObservation[] = [
  {
    resourceType: "Observation",
    id: uuidv4(),
    status: "final",
    code: { coding: [{ system: "http://loinc.org", code: "8867-4", display: "Heart Rate" }], text: "Heart Rate" },
    subject: { reference: "Patient/MRN-001" },
    effectiveDateTime: new Date().toISOString(),
    valueQuantity: { value: 72, unit: "bpm", system: "http://unitsofmeasure.org" },
  },
  {
    resourceType: "Observation",
    id: uuidv4(),
    status: "final",
    code: { coding: [{ system: "http://loinc.org", code: "8480-6", display: "Systolic Blood Pressure" }], text: "Systolic Blood Pressure" },
    subject: { reference: "Patient/MRN-001" },
    effectiveDateTime: new Date().toISOString(),
    valueQuantity: { value: 128, unit: "mmHg", system: "http://unitsofmeasure.org" },
  },
];

for (const o of seedObs) observations.set(o.id!, o);

observationRouter.get("/", (req, res) => {
  const subject = req.query.subject as string | undefined;
  const code = req.query.code as string | undefined;

  let results = Array.from(observations.values());
  if (subject) results = results.filter((o) => o.subject?.reference?.includes(subject));
  if (code) results = results.filter((o) => o.code.coding?.some((c) => c.code === code));

  const bundle: FHIRBundle = {
    resourceType: "Bundle",
    type: "searchset",
    total: results.length,
    entry: results.map((o) => ({ resource: o, fullUrl: `${req.protocol}://${req.get("host")}/Observation/${o.id}` })),
  };
  res.json(bundle);
});

observationRouter.get("/:id", (req, res) => {
  const obs = observations.get(req.params.id);
  if (!obs) {
    res.status(404).json({ resourceType: "OperationOutcome", issue: [{ severity: "error", code: "not-found", diagnostics: "Observation not found" }] });
    return;
  }
  res.json(obs);
});

observationRouter.post("/", (req, res) => {
  const id = uuidv4();
  const obs: FHIRObservation = { ...req.body, id, meta: { lastUpdated: new Date().toISOString() } };
  observations.set(id, obs);
  res.status(201).json(obs);
});
