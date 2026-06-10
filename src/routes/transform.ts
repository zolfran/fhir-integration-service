import { Router } from "express";
import { transformPatient, transformObservations, transformToBundle } from "../services/hl7-to-fhir.js";

export const transformRouter = Router();

// POST /transform/patient — Transform HL7v2 → FHIR Patient
transformRouter.post("/patient", (req, res) => {
  try {
    const hl7Raw = req.body.hl7 as string;
    if (!hl7Raw) {
      res.status(400).json({ error: "Missing 'hl7' field in request body" });
      return;
    }
    const patient = transformPatient(hl7Raw);
    res.json(patient);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transformation failed";
    res.status(422).json({ error: message });
  }
});

// POST /transform/observations — Transform HL7v2 → FHIR Observations
transformRouter.post("/observations", (req, res) => {
  try {
    const hl7Raw = req.body.hl7 as string;
    if (!hl7Raw) {
      res.status(400).json({ error: "Missing 'hl7' field in request body" });
      return;
    }
    const observations = transformObservations(hl7Raw);
    res.json(observations);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transformation failed";
    res.status(422).json({ error: message });
  }
});

// POST /transform/bundle — Transform HL7v2 → FHIR Bundle (Patient + Observations)
transformRouter.post("/bundle", (req, res) => {
  try {
    const hl7Raw = req.body.hl7 as string;
    if (!hl7Raw) {
      res.status(400).json({ error: "Missing 'hl7' field in request body" });
      return;
    }
    const bundle = transformToBundle(hl7Raw);
    res.json(bundle);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transformation failed";
    res.status(422).json({ error: message });
  }
});
