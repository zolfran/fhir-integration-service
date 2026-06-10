/**
 * HL7v2 → FHIR R4 Transformation Service
 *
 * Converts legacy pipe-delimited HL7v2 messages into FHIR R4 JSON resources.
 * This is the core "bridge" layer in a healthcare modernization stack.
 */

import { v4 as uuidv4 } from "uuid";
import type { FHIRPatient, FHIRObservation, FHIRBundle } from "../models/fhir-types.js";

interface HL7Segment {
  type: string;
  fields: string[];
}

function parseHL7(raw: string): HL7Segment[] {
  const lines = raw.replace(/\r\n/g, "\r").replace(/\n/g, "\r").split("\r").filter(Boolean);
  return lines.map((line) => {
    const fields = line.split("|");
    return { type: fields[0] ?? "", fields: fields.slice(1) };
  });
}

function getField(segment: HL7Segment, index: number, component = 0): string {
  const field = segment.fields[index] ?? "";
  if (component === 0) return field.split("^")[0] ?? "";
  const parts = field.split("^");
  return parts[component] ?? "";
}

export function transformPatient(hl7Raw: string): FHIRPatient {
  const segments = parseHL7(hl7Raw);
  const pid = segments.find((s) => s.type === "PID");

  if (!pid) throw new Error("No PID segment found in HL7 message");

  const nameField = pid.fields[4] ?? "";
  const [family, given, middle] = nameField.split("^");
  const givenNames = [given, middle].filter(Boolean) as string[];

  const dob = getField(pid, 6);
  const formattedDob = dob
    ? `${dob.slice(0, 4)}-${dob.slice(4, 6)}-${dob.slice(6, 8)}`
    : undefined;

  const genderMap: Record<string, FHIRPatient["gender"]> = {
    M: "male",
    F: "female",
    O: "other",
    U: "unknown",
  };

  const patient: FHIRPatient = {
    resourceType: "Patient",
    id: uuidv4(),
    meta: { lastUpdated: new Date().toISOString() },
    identifier: [
      {
        system: "urn:oid:2.16.840.1.113883.3.hospital",
        value: getField(pid, 2),
        type: {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/v2-0203", code: "MR", display: "Medical Record Number" }],
        },
      },
    ],
    active: true,
    name: [{ use: "official", family: family ?? "", given: givenNames }],
    gender: genderMap[getField(pid, 7)] ?? "unknown",
    birthDate: formattedDob,
    telecom: [],
    address: [],
  };

  const phone = getField(pid, 12);
  if (phone) {
    patient.telecom!.push({ system: "phone", value: phone, use: "home" });
  }

  const addressField = pid.fields[10] ?? "";
  const [line1, line2, city, state, zip] = addressField.split("^");
  if (city || state || zip) {
    patient.address!.push({
      use: "home",
      line: [line1, line2].filter(Boolean) as string[],
      city: city ?? undefined,
      state: state ?? undefined,
      postalCode: zip ?? undefined,
      country: "US",
    });
  }

  return patient;
}

export function transformObservations(hl7Raw: string): FHIRObservation[] {
  const segments = parseHL7(hl7Raw);
  const pid = segments.find((s) => s.type === "PID");
  const patientRef = pid ? getField(pid, 2) : "unknown";

  return segments
    .filter((s) => s.type === "OBX")
    .map((obx) => {
      const codeField = obx.fields[2] ?? "";
      const [code, display, system] = codeField.split("^");
      const value = getField(obx, 4);
      const unit = getField(obx, 5);
      const refRange = getField(obx, 6);
      const abnormalFlag = getField(obx, 7);

      const observation: FHIRObservation = {
        resourceType: "Observation",
        id: uuidv4(),
        meta: { lastUpdated: new Date().toISOString() },
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "laboratory",
                display: "Laboratory",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: system === "LN" ? "http://loinc.org" : `urn:oid:${system ?? "unknown"}`,
              code: code ?? "",
              display: display ?? "",
            },
          ],
          text: display ?? code ?? "",
        },
        subject: { reference: `Patient/${patientRef}` },
        effectiveDateTime: new Date().toISOString(),
      };

      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        observation.valueQuantity = {
          value: numValue,
          unit: unit,
          system: "http://unitsofmeasure.org",
        };
      } else {
        observation.valueString = value;
      }

      if (refRange) {
        const [low, high] = refRange.split("-").map((v) => parseFloat(v.trim()));
        if (!isNaN(low) && !isNaN(high)) {
          observation.referenceRange = [{ low: { value: low, unit }, high: { value: high, unit } }];
        }
      }

      if (abnormalFlag && abnormalFlag !== "N") {
        const flagMap: Record<string, string> = {
          H: "High", L: "Low", HH: "Critical High", LL: "Critical Low", A: "Abnormal",
        };
        observation.interpretation = [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                code: abnormalFlag,
                display: flagMap[abnormalFlag] ?? abnormalFlag,
              },
            ],
          },
        ];
      }

      return observation;
    });
}

export function transformToBundle(hl7Raw: string): FHIRBundle {
  const patient = transformPatient(hl7Raw);
  const observations = transformObservations(hl7Raw);

  const entries = [
    { resource: patient, fullUrl: `urn:uuid:${patient.id}` },
    ...observations.map((o) => ({ resource: o, fullUrl: `urn:uuid:${o.id}` })),
  ];

  return {
    resourceType: "Bundle",
    id: uuidv4(),
    type: "collection",
    total: entries.length,
    entry: entries,
  };
}
