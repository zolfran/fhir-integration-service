import { Router } from "express";
import type { FHIRBundle } from "../models/fhir-types.js";
import { getAllPatients, getPatientById, searchPatients, createPatient } from "../services/patient-store.js";

export const patientRouter = Router();

// GET /Patient — Search patients (FHIR search)
patientRouter.get("/", (req, res) => {
  const name = req.query.name as string | undefined;
  const identifier = req.query.identifier as string | undefined;

  const patients = name || identifier ? searchPatients({ name, identifier }) : getAllPatients();

  const bundle: FHIRBundle = {
    resourceType: "Bundle",
    type: "searchset",
    total: patients.length,
    entry: patients.map((p) => ({
      resource: p,
      fullUrl: `${req.protocol}://${req.get("host")}/Patient/${p.id}`,
    })),
  };

  res.json(bundle);
});

// GET /Patient/:id — Read a single patient
patientRouter.get("/:id", (req, res) => {
  const patient = getPatientById(req.params.id);
  if (!patient) {
    res.status(404).json({ resourceType: "OperationOutcome", issue: [{ severity: "error", code: "not-found", diagnostics: "Patient not found" }] });
    return;
  }
  res.json(patient);
});

// POST /Patient — Create a patient
patientRouter.post("/", (req, res) => {
  const patient = createPatient(req.body);
  res.status(201).json(patient);
});
