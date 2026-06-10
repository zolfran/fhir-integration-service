/**
 * In-memory patient store for demo purposes.
 * In production, this would be backed by a FHIR-compliant database.
 */

import { v4 as uuidv4 } from "uuid";
import type { FHIRPatient } from "../models/fhir-types.js";

const patients = new Map<string, FHIRPatient>();

// Seed sample data
const seedPatients: FHIRPatient[] = [
  {
    resourceType: "Patient",
    id: uuidv4(),
    active: true,
    name: [{ use: "official", family: "Doe", given: ["John", "A"] }],
    gender: "male",
    birthDate: "1985-03-15",
    identifier: [{ system: "urn:oid:2.16.840.1.113883.3.hospital", value: "MRN-001" }],
    telecom: [{ system: "phone", value: "555-1001", use: "home" }],
    address: [{ use: "home", line: ["123 Oak Street"], city: "Springfield", state: "IL", postalCode: "62701" }],
  },
  {
    resourceType: "Patient",
    id: uuidv4(),
    active: true,
    name: [{ use: "official", family: "Smith", given: ["Jane"] }],
    gender: "female",
    birthDate: "1990-07-22",
    identifier: [{ system: "urn:oid:2.16.840.1.113883.3.hospital", value: "MRN-002" }],
    telecom: [{ system: "phone", value: "555-1002", use: "home" }],
    address: [{ use: "home", line: ["456 Maple Ave"], city: "Springfield", state: "IL", postalCode: "62702" }],
  },
];

for (const p of seedPatients) {
  patients.set(p.id!, p);
}

export function getAllPatients(): FHIRPatient[] {
  return Array.from(patients.values());
}

export function getPatientById(id: string): FHIRPatient | undefined {
  return patients.get(id);
}

export function searchPatients(params: { name?: string; identifier?: string }): FHIRPatient[] {
  let results = Array.from(patients.values());

  if (params.name) {
    const q = params.name.toLowerCase();
    results = results.filter((p) =>
      p.name?.some(
        (n) =>
          n.family?.toLowerCase().includes(q) ||
          n.given?.some((g) => g.toLowerCase().includes(q)),
      ),
    );
  }

  if (params.identifier) {
    results = results.filter((p) =>
      p.identifier?.some((id) => id.value === params.identifier),
    );
  }

  return results;
}

export function createPatient(patient: FHIRPatient): FHIRPatient {
  const id = patient.id ?? uuidv4();
  const saved = { ...patient, id, meta: { lastUpdated: new Date().toISOString() } };
  patients.set(id, saved);
  return saved;
}
