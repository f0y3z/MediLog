const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const API_ORIGIN = API_BASE_URL.endsWith("/api") ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
const ACCESS_TOKEN_KEY = "medilog.access";
const REFRESH_TOKEN_KEY = "medilog.refresh";

class ApiRequestError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

function endpoint(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

function withTrailingSlash(path) {
  return path.endsWith("/") ? path : `${path}/`;
}

function authHeaders() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

function errorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data || fallback;
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  if (data.error) return data.error;
  const firstError = Object.values(data).flat().find(Boolean);
  return Array.isArray(firstError) ? firstError[0] : firstError || fallback;
}

export function safeErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const message = error?.message || "";
  if (!message) return fallback;
  if (/traceback|exception|fault|sqlite|database|integrity|celery|redis|gemini|api key|stack/i.test(message)) {
    return fallback;
  }
  return message;
}

export function setSession(tokens) {
  if (tokens?.access) localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  if (tokens?.refresh) localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hasSession() {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
}

export async function apiRequest(path, options = {}) {
  const headers = {
    ...authHeaders(),
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint(withTrailingSlash(path)), {
    ...options,
    headers,
  });
  const data = await parseResponse(response).catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      throw new ApiRequestError("Please sign in again.", response.status);
    }
    throw new ApiRequestError(errorMessage(data, "Request failed"), response.status);
  }

  return data;
}

export function postJson(path, payload) {
  return apiRequest(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function patchJson(path, payload) {
  return apiRequest(path, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function postForm(path, formData) {
  return apiRequest(path, {
    method: "POST",
    body: formData,
  });
}

export function deleteResource(path) {
  return apiRequest(path, { method: "DELETE" });
}

function absoluteFileUrl(value) {
  if (!value) return null;
  if (value.startsWith("http") || value.startsWith("blob:") || value.startsWith("/")) return value;
  return `${API_ORIGIN}/${value}`;
}

function fileMeta(value) {
  if (!value) return null;
  const url = absoluteFileUrl(value);
  const name = value.split("/").pop();
  const isPdf = name?.toLowerCase().endsWith(".pdf");
  return { name, url, kind: isPdf ? "pdf" : "image" };
}

export function mapVisit(visit) {
  return {
    id: String(visit.id),
    visitDate: visit.visit_date,
    doctorName: visit.doctor_name || "Doctor Appointment",
    clinic: visit.clinic_or_hospital || "",
    specialization: visit.specialization || "",
    chiefComplaint: visit.chief_complaint || "",
    diagnosis: visit.diagnosis || "",
    notes: visit.doctor_notes || "",
    status: visit.prescription_status,
    processing: visit.prescription_status === "PENDING" && Boolean(visit.prescription_file),
    prescriptionFile: fileMeta(visit.prescription_file),
    medications: (visit.prescriptions || []).map((item) => ({
      id: String(item.id),
      name: item.drug_name,
      dose: item.dosage,
      frequency: item.frequency,
      duration: item.duration_days ? `${item.duration_days} days` : "",
      instructions: item.instructions || "",
    })),
    testsOrdered: (visit.tests_ordered || []).map((item) => ({
      id: String(item.id),
      name: item.test_name,
      linkedReportId: item.lab_report ? String(item.lab_report) : null,
    })),
  };
}

export function mapReport(report) {
  return {
    id: String(report.id),
    testType: report.test_type,
    reportDate: report.report_date,
    linkedVisitId: report.visit ? String(report.visit) : null,
    notes: report.notes || "",
    status: report.status,
    statusDisplay: report.status_display,
    processing: report.status === "PENDING",
    file: fileMeta(report.file),
    metrics: report.metrics || {},
    summary: report.summary || "",
  };
}

export function mapSymptom(symptom) {
  return {
    id: String(symptom.id),
    name: symptom.symptom_name,
    severity: Number(symptom.severity),
    severityDisplay: symptom.severity_display,
    dateTime: symptom.logged_at,
    notes: symptom.notes || "",
  };
}

export function mapTimelineEvent(event) {
  const typeMap = {
    DOCTOR_VISIT: "Visit",
    LAB_REPORT: "Report",
    SYMPTOM: "Symptom",
  };
  return {
    id: String(event.id),
    type: typeMap[event.event_type] || event.event_type,
    date: event.timestamp,
    title: event.title,
    summary: event.subtitle || "",
    detail: event.status || "",
  };
}

export function mapProfile(profile) {
  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.first_name || "",
    lastName: profile.last_name || "",
    name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
    dob: profile.date_of_birth || "",
    gender: profile.gender || "",
    bloodGroup: profile.blood_group || "",
    createdAt: profile.created_at,
  };
}

export async function fetchWorkspaceData() {
  const [visits, reports, symptoms, timeline, profile] = await Promise.all([
    apiRequest("/visits/"),
    apiRequest("/reports/"),
    apiRequest("/symptoms/"),
    apiRequest("/timeline/"),
    apiRequest("/auth/profile/").catch(() => null),
  ]);

  return {
    visits: visits.map(mapVisit),
    reports: reports.map(mapReport),
    symptoms: symptoms.map(mapSymptom),
    timeline: timeline.map(mapTimelineEvent),
    profile: profile ? mapProfile(profile) : null,
  };
}

export async function login(email, password) {
  const tokens = await postJson("/auth/login/", { email, password });
  setSession(tokens);
  return tokens;
}

export async function register(payload) {
  return postJson("/auth/register/", payload);
}
