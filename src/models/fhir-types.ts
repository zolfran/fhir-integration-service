/**
 * FHIR R4 Resource Type Definitions
 *
 * Simplified type definitions for core FHIR R4 resources used in this service.
 * In production, use the official @types/fhir package.
 */

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
}

export interface HumanName {
  use?: "official" | "usual" | "temp" | "nickname" | "anonymous" | "old" | "maiden";
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
}

export interface Address {
  use?: "home" | "work" | "temp" | "old" | "billing";
  type?: "postal" | "physical" | "both";
  line?: string[];
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface ContactPoint {
  system?: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
  value?: string;
  use?: "home" | "work" | "temp" | "old" | "mobile";
}

export interface Identifier {
  system?: string;
  value?: string;
  type?: {
    coding?: Array<{ system?: string; code?: string; display?: string }>;
  };
}

export interface CodeableConcept {
  coding?: Array<{
    system?: string;
    code?: string;
    display?: string;
  }>;
  text?: string;
}

export interface Reference {
  reference?: string;
  display?: string;
}

export interface FHIRPatient extends FHIRResource {
  resourceType: "Patient";
  identifier?: Identifier[];
  active?: boolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  address?: Address[];
}

export interface FHIRObservation extends FHIRResource {
  resourceType: "Observation";
  status: "registered" | "preliminary" | "final" | "amended" | "cancelled";
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject?: Reference;
  effectiveDateTime?: string;
  valueQuantity?: {
    value?: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  valueString?: string;
  interpretation?: CodeableConcept[];
  referenceRange?: Array<{
    low?: { value?: number; unit?: string };
    high?: { value?: number; unit?: string };
    text?: string;
  }>;
}

export interface FHIRBundle extends FHIRResource {
  resourceType: "Bundle";
  type: "searchset" | "batch" | "transaction" | "collection";
  total?: number;
  entry?: Array<{
    resource: FHIRResource;
    fullUrl?: string;
  }>;
}

export interface CapabilityStatement extends FHIRResource {
  resourceType: "CapabilityStatement";
  status: "active" | "draft" | "retired";
  kind: "instance" | "capability" | "requirements";
  fhirVersion: string;
  format: string[];
  rest?: Array<{
    mode: "server" | "client";
    resource?: Array<{
      type: string;
      interaction?: Array<{ code: string }>;
      searchParam?: Array<{ name: string; type: string }>;
    }>;
  }>;
}
