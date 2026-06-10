import { Router } from "express";
import type { CapabilityStatement } from "../models/fhir-types.js";

export const capabilityRouter = Router();

const capability: CapabilityStatement = {
  resourceType: "CapabilityStatement",
  status: "active",
  kind: "instance",
  fhirVersion: "4.0.1",
  format: ["json"],
  rest: [
    {
      mode: "server",
      resource: [
        {
          type: "Patient",
          interaction: [{ code: "read" }, { code: "search-type" }, { code: "create" }],
          searchParam: [
            { name: "name", type: "string" },
            { name: "identifier", type: "token" },
          ],
        },
        {
          type: "Observation",
          interaction: [{ code: "read" }, { code: "search-type" }, { code: "create" }],
          searchParam: [
            { name: "subject", type: "reference" },
            { name: "code", type: "token" },
          ],
        },
      ],
    },
  ],
};

capabilityRouter.get("/", (_req, res) => {
  res.json(capability);
});
