# FHIR Integration Service

A **FHIR R4-compliant** integration microservice built with Node.js and TypeScript. This service acts as the **"bridge"** layer in a healthcare modernization stack — accepting legacy HL7v2 messages and transforming them into modern FHIR R4 JSON resources.

## What is FHIR?

[FHIR](https://hl7.org/fhir/) (Fast Healthcare Interoperability Resources) is the modern standard for exchanging healthcare data. Unlike legacy HL7v2 (pipe-delimited), FHIR uses JSON/XML with RESTful APIs, making it developer-friendly and web-native.

## Features

- **FHIR R4 REST API** — Patient and Observation endpoints following the FHIR specification
- **HL7v2 → FHIR Transformation** — Convert pipe-delimited HL7v2 messages into FHIR JSON
- **Capability Statement** — Standard FHIR metadata endpoint at `/metadata`
- **In-memory Store** — Demo-ready with pre-seeded patient and observation data
- **Type-safe** — Full TypeScript with FHIR R4 type definitions

## Quick Start

```bash
npm install
npm run dev
# Server starts at http://localhost:3001
```

## API Endpoints

### FHIR R4 Resources

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/metadata` | FHIR Capability Statement |
| `GET` | `/Patient` | Search patients |
| `GET` | `/Patient/:id` | Read patient |
| `POST` | `/Patient` | Create patient |
| `GET` | `/Observation` | Search observations |
| `GET` | `/Observation/:id` | Read observation |
| `POST` | `/Observation` | Create observation |

### HL7v2 → FHIR Transformation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/transform/patient` | HL7v2 → FHIR Patient |
| `POST` | `/transform/observations` | HL7v2 → FHIR Observations |
| `POST` | `/transform/bundle` | HL7v2 → FHIR Bundle (Patient + Observations) |

### Example: Transform HL7v2 to FHIR

```bash
curl -X POST http://localhost:3001/transform/patient \
  -H "Content-Type: application/json" \
  -d '{
    "hl7": "MSH|^~\\&|EPIC|HOSP|||20240115||ADT^A01|MSG001|P|2.5\rPID|1||MRN001||Doe^John^A||19850315|M|||123 Oak St^^Springfield^IL^62701||555-1001"
  }'
```

Returns a FHIR R4 Patient resource:

```json
{
  "resourceType": "Patient",
  "id": "uuid-here",
  "name": [{ "use": "official", "family": "Doe", "given": ["John", "A"] }],
  "gender": "male",
  "birthDate": "1985-03-15",
  "identifier": [{ "system": "urn:oid:2.16.840.1.113883.3.hospital", "value": "MRN001" }]
}
```

## Project Structure

```
fhir-integration-service/
├── src/
│   ├── index.ts                    # Express app setup
│   ├── models/
│   │   └── fhir-types.ts           # FHIR R4 TypeScript type definitions
│   ├── routes/
│   │   ├── patient.ts              # /Patient endpoints
│   │   ├── observation.ts          # /Observation endpoints
│   │   ├── transform.ts            # HL7v2 → FHIR transformation
│   │   └── capability.ts           # /metadata endpoint
│   └── services/
│       ├── hl7-to-fhir.ts          # Core transformation logic
│       └── patient-store.ts        # In-memory data store
└── tests/
```

## Related Repos

- [legacy-hl7-processor](https://github.com/zolfran/legacy-hl7-processor) — Legacy HL7v2 message parser (the "before")
- [healthcare-modernization](https://github.com/zolfran/healthcare-modernization) — Full-stack healthcare platform
- [patient-portal](https://github.com/zolfran/patient-portal) — Patient-facing web app
- [clinical-analytics](https://github.com/zolfran/clinical-analytics) — Clinical analytics dashboard

## License

MIT
