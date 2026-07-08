import healthImageOne from "../healthcare-1.jpg";
import healthImageTwo from "../healthcare-2.png";
import reportPreviewImage from "../rreport.webp";

export const slides = [healthImageOne, healthImageTwo];

export const navItems = [
  { id: "timeline", label: "Timeline" },
  { id: "log-visit", label: "Log Visit" },
  { id: "visit-detail", label: "Visit Detail" },
  { id: "upload-report", label: "Upload Lab Report" },
  { id: "report-detail", label: "Report Detail" },
  { id: "log-symptom", label: "Log Symptom" },
  { id: "symptoms-history", label: "Symptoms History" },
  { id: "ai-suggestions", label: "AI Suggestions" },
  { id: "profile-settings", label: "Profile & Settings" },
];

export const specializationOptions = ["GP", "Cardiologist", "Orthopedic", "Dermatologist", "Neurologist", "Other"];
export const testTypeOptions = ["Blood Test", "USG", "X-Ray", "ECG", "MRI", "Other"];
export const genderOptions = ["Female", "Male", "Other", "Prefer not to say"];
export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function currentDateValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function currentDateTimeValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function toTimelineSortValue(entry) {
  return new Date(entry.checkedAt || entry.dateTime || entry.date || entry.visitDate || entry.reportDate).getTime();
}

export function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function filePreviewFromFile(file) {
  if (!file) return null;

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  return {
    name: file.name,
    url: URL.createObjectURL(file),
    kind: isPdf ? "pdf" : "image",
  };
}

export function strengthMeta(value) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  if (!value) return { label: "", width: "0%", tone: "" };

  const labels = ["Weak", "Fair", "Good", "Strong"];
  const widths = ["25%", "50%", "75%", "100%"];
  const index = Math.max(score - 1, 0);

  return { label: labels[index], width: widths[index], tone: labels[index].toLowerCase() };
}

export function buildSymptomTrend(symptoms) {
  const grouped = new Map();
  symptoms.forEach((symptom) => {
    if (!grouped.has(symptom.name)) grouped.set(symptom.name, []);
    grouped.get(symptom.name).push(symptom);
  });

  const candidates = [...grouped.entries()].find(([, items]) => items.length >= 3);
  if (!candidates) return null;

  const [name, items] = candidates;
  const points = [...items]
    .sort((left, right) => new Date(left.dateTime).getTime() - new Date(right.dateTime).getTime())
    .map((item, index) => ({ x: index, y: item.severity, label: formatDateTime(item.dateTime) }));

  return { name, points };
}

export function buildSuggestion() {
  return {
    id: createId("suggestion"),
    generatedAt: new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }),
    dietPlan: {
      recommendedFoods: ["Leafy greens", "Oats", "Berries", "Yogurt"],
      foodsToReduce: ["Salty snacks", "Sugary drinks", "Deep-fried food"],
      mealTimingTips: [
        "Prioritize whole grains and lighter dinners.",
        "Build a fixed wake-up and sleep routine.",
        "Keep daily movement gentle but consistent.",
      ],
    },
    routine: {
      morning: ["Drink water before coffee", "Take a 20-minute walk", "Check blood pressure if advised"],
      evening: ["Dim screens an hour before sleep", "Stretch the neck and back", "Prepare medication for the next day"],
    },
    dos: ["Walk 30 minutes daily", "Stay hydrated", "Keep a symptom diary", "Attend scheduled follow-ups"],
    donts: ["Skip meals", "Overuse painkillers", "Ignore recurring symptoms"],
    warnings: [
      { tone: "amber", text: "Repeated headaches and elevated stress may need a rest plan." },
      { tone: "red", text: "Any chest pain with breathlessness should be reviewed urgently." },
    ],
  };
}

export const initialVisits = [
  {
    id: "visit-1001",
    visitDate: "2026-07-02",
    doctorName: "Dr. FOYEZ AHMED",
    clinic: "MediCare City Clinic",
    specialization: "Cardiologist",
    chiefComplaint: "Chest tightness after climbing stairs",
    diagnosis: "Likely stress-related strain; monitor blood pressure.",
    notes: "Return for review in two weeks.",
    processing: false,
    prescriptionFile: {
      name: "demo-prescription.png",
      url: healthImageTwo,
      kind: "image",
    },
    medications: [
      { id: "med-1", name: "Atenolol", dose: "25 mg", frequency: "Once daily", duration: "14 days" },
      { id: "med-2", name: "Vitamin D3", dose: "1000 IU", frequency: "Once daily", duration: "30 days" },
    ],
    testsOrdered: [
      { id: "test-1", name: "ECG", linkedReportId: "report-1001" },
      { id: "test-2", name: "Blood Pressure Log", linkedReportId: null },
    ],
  },
];

export const initialReports = [
  {
    id: "report-1001",
    testType: "ECG",
    reportDate: "2026-07-03",
    linkedVisitId: "visit-1001",
    notes: "Uploaded after follow-up.",
    processing: false,
    file: {
      name: "demo-report.pdf",
      url: reportPreviewImage,
      kind: "image",
    },
    metrics: {
      HeartRate: "78 bpm",
      PR: "160 ms",
      QRS: "92 ms",
      QTc: "402 ms",
    },
    summary:
      "The rhythm is regular with no obvious acute abnormality. Overall interpretation is reassuring and should be reviewed alongside symptoms.",
  },
];

export const initialSymptoms = [
  {
    id: "symptom-1",
    name: "Headache",
    severity: 6,
    dateTime: "2026-07-04T08:15",
    notes: "Started after a long screen session.",
  },
  {
    id: "symptom-2",
    name: "Headache",
    severity: 4,
    dateTime: "2026-07-02T19:40",
    notes: "Improved after rest and hydration.",
  },
  {
    id: "symptom-3",
    name: "Headache",
    severity: 5,
    dateTime: "2026-06-29T07:25",
    notes: "Mild pressure behind the eyes.",
  },
  {
    id: "symptom-4",
    name: "Back pain",
    severity: 7,
    dateTime: "2026-06-27T21:10",
    notes: "Worse after lifting a heavy bag.",
  },
];

export const initialVitals = [
  {
    id: "vitals-1001",
    checkedAt: "2026-07-04T08:30",
    systolic: 124,
    diastolic: 82,
    heartRate: 76,
    notes: "Morning check before breakfast.",
  },
  {
    id: "vitals-1002",
    checkedAt: "2026-07-03T20:10",
    systolic: 128,
    diastolic: 84,
    heartRate: 80,
    notes: "Evening check after a walk.",
  },
];

export const initialSuggestion = {
  id: "suggestion-1",
  generatedAt: "Today, 8:40 AM",
  dietPlan: {
    recommendedFoods: ["Leafy greens", "Oats", "Berries", "Yogurt"],
    foodsToReduce: ["Salty snacks", "Sugary drinks", "Deep-fried food"],
    mealTimingTips: ["Eat a light breakfast within 1 hour of waking", "Keep dinner 2-3 hours before sleep"],
  },
  routine: {
    morning: ["Drink water before coffee", "Take a 20-minute walk", "Check blood pressure if advised"],
    evening: ["Dim screens an hour before sleep", "Stretch the neck and back", "Prepare medication for the next day"],
  },
  dos: ["Walk 30 minutes daily", "Stay hydrated", "Keep a symptom diary", "Attend scheduled follow-ups"],
  donts: ["Skip meals", "Overuse painkillers", "Ignore recurring symptoms"],
  warnings: [
    { tone: "amber", text: "Repeated headaches and elevated stress may need a rest plan." },
    { tone: "red", text: "Any chest pain with breathlessness should be reviewed urgently." },
  ],
};

export const initialProfile = {
  firstName: "",
  lastName: "",
  name: "",
  dob: "",
  gender: "",
  bloodGroup: "",
};
