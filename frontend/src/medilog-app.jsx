import { useEffect, useMemo, useState } from "preact/hooks";
import healthImageOne from "../healthcare-1.jpg";
import healthImageTwo from "../healthcare-2.png";
import reportPreviewImage from "../rreport.webp";

const slides = [healthImageOne, healthImageTwo];

const navItems = [
  { id: "timeline", label: "Timeline" },
  { id: "log-visit", label: "Log Visit" },
  { id: "visit-detail", label: "Visit Detail" },
  { id: "upload-report", label: "Upload Lab Report" },
  { id: "report-detail", label: "Report Detail" },
  { id: "vitals-log", label: "Vitals Check-in" },
  { id: "vitals-report", label: "Vitals Report" },
  { id: "log-symptom", label: "Log Symptom" },
  { id: "symptoms-history", label: "Symptoms History" },
  { id: "ai-suggestions", label: "AI Suggestions" },
  { id: "profile-settings", label: "Profile & Settings" },
];

const specializationOptions = ["GP", "Cardiologist", "Orthopedic", "Dermatologist", "Neurologist", "Other"];
const testTypeOptions = ["Blood Test", "USG", "X-Ray", "ECG", "MRI", "Other"];
const genderOptions = ["Female", "Male", "Other", "Prefer not to say"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function currentDateValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function currentDateTimeValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toTimelineSortValue(entry) {
  return new Date(entry.checkedAt || entry.dateTime || entry.date || entry.visitDate || entry.reportDate).getTime();
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function filePreviewFromFile(file) {
  if (!file) return null;

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  return {
    name: file.name,
    url: URL.createObjectURL(file),
    kind: isPdf ? "pdf" : "image",
  };
}

const initialVisits = [
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

const initialReports = [
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

const initialSymptoms = [
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

const initialVitals = [
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

const initialSuggestion = {
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

const initialProfile = {
  name: "DURJOY DIP",
  dob: "1994-08-21",
  gender: "Female",
  bloodGroup: "O+",
};

function PasswordInput({ placeholder, value, onInput }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field-control">
      <span className="field-icon"></span>
      <input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onInput={onInput}
        required
      />
      <button
        className="icon-button"
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? "hide" : "show"}
      </button>
    </div>
  );
}

function HeroSlider({ mode }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="hero-panel" aria-label="MediLog welcome images">
      <div className="brand-row"></div>

      <div className="slide-stage">
        {slides.map((src, slideIndex) => (
          <img
            key={src}
            className={"hero-image " + (slideIndex === index ? "active" : "")}
            src={src}
            alt="Healthcare support"
          />
        ))}
      </div>

      <div className="hero-shade" />

      <div className="hero-content">
        <div className="slide-dots" aria-label="Choose hero image">
          {slides.map((_, slideIndex) => (
            <button
              key={slideIndex}
              type="button"
              className={slideIndex === index ? "active" : ""}
              onClick={() => setIndex(slideIndex)}
              aria-label={"Show slide " + (slideIndex + 1)}
            />
          ))}
        </div>

        <h2>
          {mode === "login" ? "Caring for Your Health Every Day" : "Start Your Health"}
          <span>{mode === "login" ? " With Trusted Support" : " Journey Today"}</span>
        </h2>
        <p>
          Personalized healthcare support, appointment tracking, records, medication reminders, and wellness follow-up for every stage of life.
        </p>

        <div className="feature-strip">
          <div className="feature">
            <span className="feature-icon clinic" />
            <strong>Primary Care</strong>
          </div>
          <div className="feature">
            <span className="feature-icon plan" />
            <strong>Specialist Support</strong>
          </div>
          <div className="feature">
            <span className="feature-icon track" />
            <strong>Track & Follow Up</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function AuthHeader({ title, text }) {
  return (
    <div className="auth-header">
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function LoginCard({ onSwitch, onSubmit }) {
  return (
    <div className="auth-card">
      <AuthHeader
        title="Welcome Back"
        text="Sign in to manage appointments, records, medications, and wellness plans."
      />

      <form onSubmit={onSubmit}>
        <label>
          <div className="field-control">
            <span className="field-icon"></span>
            <input type="email" placeholder="Enter your email" required />
          </div>
        </label>

        <label>
          <PasswordInput placeholder="Enter your password" />
        </label>

        <button className="primary-button" type="submit">
          Sign In <span>→</span>
        </button>
      </form>

      <p className="switch-copy">
        New here?
        <button type="button" onClick={onSwitch}>Create an account</button>
      </p>

      <blockquote>A little care today for a lifetime of happiness tomorrow.</blockquote>
    </div>
  );
}

function strengthMeta(value) {
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

function RegisterCard({ onSwitch, onSubmit }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const meta = strengthMeta(password);

  function handleSubmit(event) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    onSubmit(event);
  }

  return (
    <div className="auth-card register-card">
      <AuthHeader
        title="Create Account"
        text="Create your account to organize care, track health updates, and stay connected with support."
      />

      <form onSubmit={handleSubmit}>
        <div className="two-column">
          <label>
            <div className="field-control">
              <input type="text" placeholder="First name" required />
            </div>
          </label>
          <label>
            <div className="field-control">
              <input type="text" placeholder="Last name" required />
            </div>
          </label>
        </div>

        <label>
          <div className="field-control">
            <input type="email" placeholder="Enter your email" required />
          </div>
        </label>

        <label>
          <div className="field-control">
            <input type="tel" placeholder="+880 1xxx-xxxxxx" />
          </div>
        </label>

        <label>
          <PasswordInput
            placeholder="Enter your password"
            value={password}
            onInput={(event) => setPassword(event.currentTarget.value)}
          />
          <span className="strength-track">
            <span className={"strength-fill " + meta.tone} style={{ width: meta.width }} />
          </span>
          <small>{meta.label}</small>
        </label>
        <label>
          <PasswordInput
            placeholder="Confirm your password"
            value={confirmPassword}
            onInput={(event) => {
              setConfirmPassword(event.currentTarget.value);
              if (error) setError("");
            }}
          />
          {error && <small className="error-message">{error}</small>}
        </label>

        <label className="check-row">
          <input type="checkbox" required />
          <span>I agree to the Terms and Privacy Policy</span>
        </label>

        <button className="primary-button" type="submit">
          Create Account <span>→</span>
        </button>
      </form>

      <p className="switch-copy">
        Already have an account?
        <button type="button" onClick={onSwitch}>Sign in</button>
      </p>
    </div>
  );
}

function buildTimelineEntries(visits, reports, symptoms, vitals) {
  const visitEntries = visits.map((visit) => ({
    id: visit.id,
    type: "Visit",
    date: visit.visitDate,
    title: visit.doctorName,
    summary: visit.chiefComplaint,
    detail: `${visit.clinic} · ${visit.specialization}`,
  }));

  const reportEntries = reports.map((report) => ({
    id: report.id,
    type: "Report",
    date: report.reportDate,
    title: report.testType,
    summary: report.summary || "Lab report uploaded",
    detail: report.linkedVisitId ? "Linked to a visit" : "No visit link yet",
  }));

  const symptomEntries = symptoms.map((symptom) => ({
    id: symptom.id,
    type: "Symptom",
    date: symptom.dateTime,
    title: symptom.name,
    summary: `Severity ${symptom.severity}/10`,
    detail: symptom.notes || "No notes added",
    severity: symptom.severity,
  }));

  const vitalsEntries = vitals.map((vital) => ({
    id: vital.id,
    type: "Vitals",
    date: vital.checkedAt,
    title: `BP ${vital.systolic}/${vital.diastolic} mmHg`,
    summary: `Heart rate ${vital.heartRate} bpm`,
    detail: vital.notes || "Vitals check-in",
  }));

  return [...visitEntries, ...reportEntries, ...symptomEntries, ...vitalsEntries].sort((left, right) => toTimelineSortValue(right) - toTimelineSortValue(left));
}

function useToastState() {
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return [toast, setToast];
}

function DashboardHeader({ title, subtitle, onSignOut }) {
  return (
    <header className="workspace-topbar">
      <div>
        <span className="eyebrow">MediLog Workspace</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <button className="ghost-button" type="button" onClick={onSignOut}>Sign out</button>
    </header>
  );
}

function TimelinePage({ visits, reports, symptoms, vitals, onOpenEntry, onSignOut }) {
  const [filterType, setFilterType] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const entries = useMemo(() => buildTimelineEntries(visits, reports, symptoms, vitals), [visits, reports, symptoms, vitals]);

  const filteredEntries = entries.filter((entry) => {
    if (filterType !== "All" && entry.type !== filterType) return false;
    if (startDate && entry.date < startDate) return false;
    if (endDate && entry.date > endDate) return false;
    return true;
  });

  return (
    <section className="workspace-page">
      <DashboardHeader
        title="Timeline"
        subtitle="Chronological feed of every entry. Filter by type and date range, then open any card for the full detail view."
        onSignOut={() => onSignOut("login")}
      />

      <div className="workspace-card">
        <div className="page-toolbar">
          <div className="segmented-controls">
            {["All", "Visit", "Report", "Symptom", "Vitals"].map((item) => (
              <button
                key={item}
                type="button"
                className={filterType === item ? 'active' : ''}
                onClick={() => setFilterType(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="date-filters">
            <label>
              <span>Start date</span>
              <input type="date" value={startDate} onInput={(event) => setStartDate(event.currentTarget.value)} />
            </label>
            <label>
              <span>End date</span>
              <input type="date" value={endDate} onInput={(event) => setEndDate(event.currentTarget.value)} />
            </label>
          </div>
        </div>

        <div className="timeline-feed">
          {filteredEntries.map((entry) => (
            <button
              key={entry.type + entry.id}
              type="button"
              className="timeline-feed-card"
              onClick={() => onOpenEntry(entry)}
            >
              <div className="timeline-feed-card-top">
                <span className={"entry-type type-" + entry.type.toLowerCase()}>{entry.type}</span>
                <time>{formatDate(entry.date)}</time>
              </div>
              <h3>{entry.title}</h3>
              <p>{entry.summary}</p>
              <small>{entry.detail}</small>
            </button>
          ))}

          {!filteredEntries.length && <div className="empty-state">No entries match the current filters.</div>}
        </div>
      </div>
    </section>
  );
}

function VisitDetailPage({ visits, reports, selectedVisitId, onUpdateVisit, onDeleteVisit, onNavigate, setToast }) {
  const visit = visits.find((item) => item.id === selectedVisitId) || visits[0] || null;
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [medicationDraft, setMedicationDraft] = useState({ name: "", dose: "", frequency: "", duration: "" });

  useEffect(() => {
    if (!visit) return;
    setDraft(visit);
    setEditorOpen(false);
    setMedicationDraft({ name: "", dose: "", frequency: "", duration: "" });
  }, [visit?.id]);

  if (!visit) {
    return (
      <section className="workspace-page">
        <DashboardHeader
          title="Visit Detail"
          subtitle="No doctor visit is available yet."
          onSignOut={() => onNavigate("login")}
        />
      </section>
    );
  }

  const linkedReports = reports.filter((report) => report.linkedVisitId === visit.id);

  function saveVisit(event) {
    event.preventDefault();
    onUpdateVisit(visit.id, draft);
    setEditorOpen(false);
    setToast("Visit updated");
  }

  function updateMedication(id, field, value) {
    const nextMedications = (draft?.medications || []).map((medication) => (
      medication.id === id ? { ...medication, [field]: value } : medication
    ));
    setDraft({ ...draft, medications: nextMedications });
  }

  function addMedication() {
    if (!medicationDraft.name.trim()) return;
    const nextMedications = [
      ...(draft?.medications || []),
      { id: createId("med"), ...medicationDraft },
    ];
    setDraft({ ...draft, medications: nextMedications });
    setMedicationDraft({ name: "", dose: "", frequency: "", duration: "" });
  }

  function deleteVisit() {
    onDeleteVisit(visit.id);
    onNavigate("timeline");
    setToast("Visit deleted");
  }

  return (
    <section className="workspace-page">
      <DashboardHeader
        title="Visit Detail"
        subtitle="View one doctor visit with prescriptions, linked tests, the file viewer, and manual medication editing."
        onSignOut={() => onNavigate("login")}
      />

      <div className="detail-layout">
        <div className="workspace-card detail-main">
          <div className="card-top-row">
            <div>
              <span className="eyebrow">Doctor Visit</span>
              <h2>{visit.doctorName}</h2>
            </div>
            <div className="card-actions">
              <button type="button" className="ghost-button" onClick={() => setEditorOpen((current) => !current)}>
                {editorOpen ? "Close editor" : "Edit"}
              </button>
              <button type="button" className="ghost-button danger" onClick={deleteVisit}>Delete</button>
            </div>
          </div>

          {visit.processing && <div className="processing-banner">Prescription file is being processed. Medications and tests will populate shortly.</div>}

          <div className="detail-grid">
            <div className="summary-panel">
              <p><strong>Date:</strong> {formatDate(visit.visitDate)}</p>
              <p><strong>Clinic:</strong> {visit.clinic}</p>
              <p><strong>Specialization:</strong> {visit.specialization}</p>
              <p><strong>Chief Complaint:</strong> {visit.chiefComplaint}</p>
              <p><strong>Diagnosis:</strong> {visit.diagnosis || "Pending review"}</p>
              <p><strong>Notes:</strong> {visit.notes || "None"}</p>
            </div>

            <div className="file-viewer">
              <span className="eyebrow">Prescription File Viewer</span>
              {visit.prescriptionFile ? (
                visit.prescriptionFile.kind === "pdf" ? (
                  <iframe title="Prescription PDF preview" src={visit.prescriptionFile.url} />
                ) : (
                  <img src="prescription.jpg" alt={visit.prescriptionFile.name} />
                )
              ) : (
                <div className="empty-state">No prescription file uploaded.</div>
              )}
              {visit.prescriptionFile && <small>{visit.prescriptionFile.name}</small>}
            </div>
          </div>

          <div className="nested-card">
            <div className="card-top-row">
              <div>
                <span className="eyebrow">Prescription</span>
                <h3>Medications</h3>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Dose</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(draft?.medications || []).map((medication) => (
                    <tr key={medication.id}>
                      <td><input value={medication.name} onInput={(event) => updateMedication(medication.id, "name", event.currentTarget.value)} /></td>
                      <td><input value={medication.dose} onInput={(event) => updateMedication(medication.id, "dose", event.currentTarget.value)} /></td>
                      <td><input value={medication.frequency} onInput={(event) => updateMedication(medication.id, "frequency", event.currentTarget.value)} /></td>
                      <td><input value={medication.duration} onInput={(event) => updateMedication(medication.id, "duration", event.currentTarget.value)} /></td>
                      <td>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => setDraft({ ...draft, medications: draft.medications.filter((item) => item.id !== medication.id) })}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="add-row">
              <input placeholder="Medication name" value={medicationDraft.name} onInput={(event) => setMedicationDraft({ ...medicationDraft, name: event.currentTarget.value })} />
              <input placeholder="Dose" value={medicationDraft.dose} onInput={(event) => setMedicationDraft({ ...medicationDraft, dose: event.currentTarget.value })} />
              <input placeholder="Frequency" value={medicationDraft.frequency} onInput={(event) => setMedicationDraft({ ...medicationDraft, frequency: event.currentTarget.value })} />
              <input placeholder="Duration" value={medicationDraft.duration} onInput={(event) => setMedicationDraft({ ...medicationDraft, duration: event.currentTarget.value })} />
              <button type="button" className="primary-button compact" onClick={addMedication}>Add medication</button>
            </div>
          </div>

          <div className="nested-card">
            <span className="eyebrow">Tests Ordered</span>
            <ul className="linked-list">
              {(visit.testsOrdered || []).map((test) => (
                <li key={test.id}>
                  <span>{test.name}</span>
                  {test.linkedReportId ? <span className="linked-pill">Linked report</span> : <span className="linked-pill muted">Not linked yet</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {editorOpen && draft && (
          <form className="workspace-card detail-side" onSubmit={saveVisit}>
            <span className="eyebrow">Edit Visit</span>
            <label>
              Visit Date
              <input type="date" value={draft.visitDate} onInput={(event) => setDraft({ ...draft, visitDate: event.currentTarget.value })} />
            </label>
            <label>
              Doctor Name
              <input type="text" value={draft.doctorName} onInput={(event) => setDraft({ ...draft, doctorName: event.currentTarget.value })} />
            </label>
            <label>
              Clinic / Hospital
              <input type="text" value={draft.clinic} onInput={(event) => setDraft({ ...draft, clinic: event.currentTarget.value })} />
            </label>
            <label>
              Specialization
              <select value={draft.specialization} onChange={(event) => setDraft({ ...draft, specialization: event.currentTarget.value })}>
                {specializationOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>
              Chief Complaint
              <textarea rows="4" value={draft.chiefComplaint} onInput={(event) => setDraft({ ...draft, chiefComplaint: event.currentTarget.value })} />
            </label>
            <label>
              Diagnosis
              <textarea rows="4" value={draft.diagnosis} onInput={(event) => setDraft({ ...draft, diagnosis: event.currentTarget.value })} />
            </label>
            <label>
              Additional Notes
              <textarea rows="4" value={draft.notes} onInput={(event) => setDraft({ ...draft, notes: event.currentTarget.value })} />
            </label>
            <button type="submit" className="primary-button">Save changes</button>
          </form>
        )}
      </div>

      <div className="workspace-footer-actions">
        <button type="button" className="ghost-button" onClick={() => onNavigate("timeline")}>Back to timeline</button>
        {linkedReports[0] && <button type="button" className="ghost-button" onClick={() => onNavigate("report-detail", linkedReports[0].id)}>Open linked report</button>}
      </div>
    </section>
  );
}

function VisitFormPage({ onCreateVisit, onNavigate, setToast }) {
  const [form, setForm] = useState({
    visitDate: currentDateValue(),
    doctorName: "",
    clinic: "",
    specialization: "GP",
    chiefComplaint: "",
    additionalNotes: "",
    prescriptionFile: null,
  });

  function submitVisit(event) {
    event.preventDefault();
    onCreateVisit(form);
    setToast("Doctor visit saved");
    setForm({
      visitDate: currentDateValue(),
      doctorName: "",
      clinic: "",
      specialization: "GP",
      chiefComplaint: "",
      additionalNotes: "",
      prescriptionFile: null,
    });
    onNavigate("timeline");
  }

  return (
    <section className="workspace-page">
      <DashboardHeader
        title="Log Doctor Visit"
        subtitle="Create a new DoctorVisit, attach a prescription file, and let the parser auto-populate medications and tests when available."
        onSignOut={() => onNavigate("login")}
      />

      <form className="workspace-card form-card" onSubmit={submitVisit}>
        <div className="field-grid">
          <label>
            Visit Date
            <input type="date" required value={form.visitDate} onInput={(event) => setForm({ ...form, visitDate: event.currentTarget.value })} />
          </label>
          <label>
            Doctor Name
            <input type="text" required value={form.doctorName} onInput={(event) => setForm({ ...form, doctorName: event.currentTarget.value })} />
          </label>
          <label>
            Clinic / Hospital
            <input type="text" required value={form.clinic} onInput={(event) => setForm({ ...form, clinic: event.currentTarget.value })} />
          </label>
          <label>
            Specialization
            <select value={form.specialization} onChange={(event) => setForm({ ...form, specialization: event.currentTarget.value })}>
              {specializationOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <label>
          Chief Complaint
          <textarea rows="4" required value={form.chiefComplaint} onInput={(event) => setForm({ ...form, chiefComplaint: event.currentTarget.value })} placeholder="Why did you visit?" />
        </label>

        <label>
          Prescription File
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(event) => setForm({ ...form, prescriptionFile: filePreviewFromFile(event.currentTarget.files?.[0] || null) })}
          />
        </label>

        <label>
          Additional Notes
          <textarea rows="4" value={form.additionalNotes} onInput={(event) => setForm({ ...form, additionalNotes: event.currentTarget.value })} placeholder="Optional" />
        </label>

        <div className="helper-card">
          <strong>Processing note</strong>
          <p>If a prescription file is attached, MediLog will show a processing banner while auto-filled medications and tests are prepared.</p>
        </div>

        <button className="primary-button" type="submit">Save visit</button>
      </form>
    </section>
  );
}

function ReportDetailPage({ reports, visits, selectedReportId, onDeleteReport, onNavigate, setToast }) {
  const report = reports.find((item) => item.id === selectedReportId) || reports[0] || null;

  if (!report) {
    return (
      <section className="workspace-page">
        <DashboardHeader
          title="Report Detail"
          subtitle="No lab report is available yet."
          onSignOut={() => onNavigate("login")}
        />
      </section>
    );
  }

  const linkedVisit = visits.find((visit) => visit.id === report.linkedVisitId) || null;

  function deleteReport() {
    onDeleteReport(report.id);
    onNavigate("timeline");
    setToast("Report deleted");
  }

  return (
    <section className="workspace-page">
      <DashboardHeader
        title="Report Detail"
        subtitle="View the uploaded lab report, extracted metrics, linked visit, and AI summary."
        onSignOut={() => onNavigate("login")}
      />

      <div className="detail-layout single-column">
        <div className="workspace-card detail-main">
          <div className="card-top-row">
            <div>
              <span className="eyebrow">Lab Report</span>
              <h2>{report.testType}</h2>
            </div>
            <button type="button" className="ghost-button danger" onClick={deleteReport}>Delete</button>
          </div>

          {report.processing && <div className="processing-banner">Report is still being parsed. Metrics and summary will appear shortly.</div>}

          <div className="detail-grid">
            <div className="summary-panel">
              <p><strong>Test Type:</strong> {report.testType}</p>
              <p><strong>Report Date:</strong> {formatDate(report.reportDate)}</p>
              <p><strong>Linked Visit:</strong> {linkedVisit ? linkedVisit.doctorName : "No linked visit"}</p>
              <p><strong>Notes:</strong> {report.notes || "None"}</p>
            </div>

            <div className="file-viewer">
              <span className="eyebrow">File Viewer</span>
              {report.file ? (
                report.file.kind === "pdf" ? (
                  <iframe title="Report PDF preview" src={report.file.url} />
                ) : (
                  <img src={report.file.url || reportPreviewImage} alt={report.file.name || "Report preview"} />
                )
              ) : (
                <div className="empty-state">No report file uploaded.</div>
              )}
              {report.file && <small>{report.file.name}</small>}
            </div>
          </div>

          <div className="nested-card">
            <span className="eyebrow">Metrics</span>
            <div className="metrics-grid">
              {Object.entries(report.metrics || {}).map(([key, value]) => (
                <div className="metric-tile" key={key}>
                  <strong>{key}</strong>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="nested-card">
            <span className="eyebrow">AI Summary</span>
            <p className="summary-copy">{report.summary || "No summary available yet."}</p>
          </div>
        </div>
      </div>

      <div className="workspace-footer-actions">
        <button type="button" className="ghost-button" onClick={() => onNavigate("upload-report")}>Upload another report</button>
        {linkedVisit && <button type="button" className="ghost-button" onClick={() => onNavigate("visit-detail", linkedVisit.id)}>Open linked visit</button>}
      </div>
    </section>
  );
}

function ReportFormPage({ visits, onCreateReport, onNavigate, setToast }) {
  const [form, setForm] = useState({
    testType: "Blood Test",
    reportDate: currentDateValue(),
    linkedVisitId: "",
    notes: "",
    file: null,
  });

  function submitReport(event) {
    event.preventDefault();
    onCreateReport(form);
    setToast("Lab report uploaded");
    setForm({
      testType: "Blood Test",
      reportDate: currentDateValue(),
      linkedVisitId: "",
      notes: "",
      file: null,
    });
    onNavigate("timeline");
  }

  return (
    <section className="workspace-page">
      <DashboardHeader
        title="Upload Lab Report"
        subtitle="Upload a new lab report, optionally link it to a visit, and let parsed metrics and summary populate after processing."
        onSignOut={() => onNavigate("login")}
      />

      <form className="workspace-card form-card" onSubmit={submitReport}>
        <div className="field-grid">
          <label>
            Test Type
            <select value={form.testType} onChange={(event) => setForm({ ...form, testType: event.currentTarget.value })}>
              {testTypeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Report Date
            <input type="date" required value={form.reportDate} onInput={(event) => setForm({ ...form, reportDate: event.currentTarget.value })} />
          </label>
          <label>
            Link to Visit (optional)
            <select value={form.linkedVisitId} onChange={(event) => setForm({ ...form, linkedVisitId: event.currentTarget.value })}>
              <option value="">Pick from past visits</option>
              {visits.map((visit) => <option key={visit.id} value={visit.id}>{formatDate(visit.visitDate)} - {visit.doctorName}</option>)}
            </select>
          </label>
        </div>

        <label>
          Report File
          <input
            type="file"
            accept=".pdf,image/*"
            required
            onChange={(event) => setForm({ ...form, file: filePreviewFromFile(event.currentTarget.files?.[0] || null) })}
          />
        </label>

        <label>
          Notes
          <textarea rows="4" value={form.notes} onInput={(event) => setForm({ ...form, notes: event.currentTarget.value })} placeholder="Optional context" />
        </label>

        <div className="helper-card">
          <strong>Processing note</strong>
          <p>Once the report is uploaded, MediLog surfaces a processing banner and fills the extracted metrics and summary after parsing finishes.</p>
        </div>

        <button className="primary-button" type="submit">Upload report</button>
      </form>
    </section>
  );
}

function LogSymptomPage({ onCreateSymptom, onNavigate, setToast }) {
  const [form, setForm] = useState({
    name: "",
    severity: 5,
    dateTime: currentDateTimeValue(),
    notes: "",
  });

  function submitSymptom(event) {
    event.preventDefault();
    onCreateSymptom(form);
    setToast("Symptom logged");
    setForm({ name: "", severity: 5, dateTime: currentDateTimeValue(), notes: "" });
    onNavigate("symptoms-history");
  }

  return (
    <section className="workspace-page">
      <DashboardHeader
        title="Log Symptom"
        subtitle="Use the quick symptom form to capture timing, severity, and optional notes."
        onSignOut={() => onNavigate("login")}
      />

      <form className="workspace-card form-card compact-form" onSubmit={submitSymptom}>
        <label>
          Symptom Name
          <input list="symptom-suggestions" type="text" required value={form.name} onInput={(event) => setForm({ ...form, name: event.currentTarget.value })} placeholder="Start typing a symptom" />
          <datalist id="symptom-suggestions">
            <option value="Headache" />
            <option value="Back pain" />
            <option value="Fever" />
            <option value="Cough" />
            <option value="Nausea" />
          </datalist>
        </label>

        <label>
          Severity: {form.severity}
          <input type="range" min="1" max="10" value={form.severity} onInput={(event) => setForm({ ...form, severity: Number(event.currentTarget.value) })} />
        </label>

        <label>
          Date & Time
          <input type="datetime-local" value={form.dateTime} onInput={(event) => setForm({ ...form, dateTime: event.currentTarget.value })} />
        </label>

        <label>
          Notes
          <textarea rows="4" value={form.notes} onInput={(event) => setForm({ ...form, notes: event.currentTarget.value })} placeholder="Optional" />
        </label>

        <button className="primary-button" type="submit">Save symptom</button>
      </form>
    </section>
  );
}

function buildSymptomTrend(symptoms) {
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

function TrendChart({ points }) {
  const width = 420;
  const height = 180;
  const padding = 28;
  const maxValue = 10;
  const minValue = 1;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const step = points.length > 1 ? usableWidth / (points.length - 1) : 0;

  const svgPoints = points.map((point, index) => {
    const x = padding + step * index;
    const y = padding + usableHeight - ((point.y - minValue) / (maxValue - minValue)) * usableHeight;
    return `${x},${y}`;
  });

  return (
    <svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Symptom severity trend chart">
      <polyline points={svgPoints.join(" ")} />
      {points.map((point, index) => {
        const x = padding + step * index;
        const y = padding + usableHeight - ((point.y - minValue) / (maxValue - minValue)) * usableHeight;
        return <circle key={point.label + index} cx={x} cy={y} r="5" />;
      })}
    </svg>
  );
}

function SymptomsHistoryPage({ symptoms, onNavigate, setSelectedSymptomName }) {
  const [nameFilter, setNameFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredSymptoms = symptoms.filter((symptom) => {
    if (nameFilter && !symptom.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
    if (startDate && symptom.dateTime.slice(0, 10) < startDate) return false;
    if (endDate && symptom.dateTime.slice(0, 10) > endDate) return false;
    return true;
  });

  const trend = buildSymptomTrend(filteredSymptoms.length ? filteredSymptoms : symptoms);

  return (
    <section className="workspace-page">
      <DashboardHeader
        title="Symptoms History"
        subtitle="Track severity over time, filter by name and date, and review a trend chart when a symptom appears at least three times."
        onSignOut={() => onNavigate("login")}
      />

      <div className="detail-layout single-column">
        <div className="workspace-card">
          <div className="page-toolbar compact-toolbar">
            <label>
              Symptom name
              <input type="text" value={nameFilter} onInput={(event) => setNameFilter(event.currentTarget.value)} placeholder="Filter by symptom" />
            </label>
            <label>
              Start date
              <input type="date" value={startDate} onInput={(event) => setStartDate(event.currentTarget.value)} />
            </label>
            <label>
              End date
              <input type="date" value={endDate} onInput={(event) => setEndDate(event.currentTarget.value)} />
            </label>
          </div>

          <div className="symptom-list">
            {filteredSymptoms.map((symptom) => (
              <button key={symptom.id} type="button" className="symptom-row" onClick={() => setSelectedSymptomName(symptom.name)}>
                <div>
                  <strong>{symptom.name}</strong>
                  <p>{symptom.notes || "No notes"}</p>
                </div>
                <div className="symptom-meta">
                  <span className="severity-badge">{symptom.severity}/10</span>
                  <time>{formatDateTime(symptom.dateTime)}</time>
                </div>
              </button>
            ))}

            {!filteredSymptoms.length && <div className="empty-state">No symptoms match the current filters.</div>}
          </div>
        </div>

        {trend && (
          <div className="workspace-card chart-card">
            <span className="eyebrow">Severity Trend</span>
            <h3>{trend.name}</h3>
            <TrendChart points={trend.points} />
            <div className="trend-legend">
              {trend.points.map((point) => (
                <span key={point.label}>{point.y}/10</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function buildSuggestion() {
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

function AISuggestionsPage({ suggestion, onRegenerate, onNavigate }) {
  return (
    <section className="workspace-page">
      <DashboardHeader
        title="AI Health Suggestions"
        subtitle="The latest health suggestion is split into diet, routine, dos, don'ts, and early warnings."
        onSignOut={() => onNavigate("login")}
      />

      <div className="workspace-card">
        <div className="card-top-row">
          <div>
            <span className="eyebrow">Latest AI Analysis</span>
            <h2>Health Suggestion</h2>
          </div>
          <button type="button" className="primary-button compact" onClick={onRegenerate}>Regenerate</button>
        </div>
        <p className="timestamp-copy">Last generated: {suggestion ? suggestion.generatedAt : "No suggestion generated yet"}</p>

        {!suggestion ? (
          <div className="empty-state">Add more health data to generate a personalized AI suggestion.</div>
        ) : (
          <div className="suggestion-grid">
            <article>
              <span className="eyebrow">Diet Plan</span>
              <ul>
                <li><strong>Recommended:</strong> {suggestion.dietPlan.recommendedFoods.join(", ")}</li>
                <li><strong>Reduce:</strong> {suggestion.dietPlan.foodsToReduce.join(", ")}</li>
                <li><strong>Meal timing:</strong> {suggestion.dietPlan.mealTimingTips.join(" ")}</li>
              </ul>
            </article>
            <article>
              <span className="eyebrow">Daily Routine</span>
              <ul>
                <li><strong>Morning:</strong> {suggestion.routine.morning.join(" · ")}</li>
                <li><strong>Evening:</strong> {suggestion.routine.evening.join(" · ")}</li>
              </ul>
            </article>
            <article>
              <span className="eyebrow">Dos</span>
              <ul>{suggestion.dos.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
            <article>
              <span className="eyebrow">Don'ts</span>
              <ul>{suggestion.donts.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
            <article className="warning-panel">
              <span className="eyebrow">Early Warnings</span>
              <ul>
                {suggestion.warnings.map((warning) => (
                  <li key={warning.text} className={warning.tone}>{warning.text}</li>
                ))}
              </ul>
            </article>
          </div>
        )}
      </div>
    </section>
  );
}

function ProfileSettingsPage({ profile, setProfile, onNavigate, setToast }) {
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });

  function saveProfile(event) {
    event.preventDefault();
    setToast("Profile updated");
  }

  function savePassword(event) {
    event.preventDefault();
    setToast("Password change saved for demo purposes");
    setPasswordForm({ current: "", next: "", confirm: "" });
  }

  return (
    <section className="workspace-page">
      <DashboardHeader
        title="Profile & Settings"
        subtitle="View and edit your profile, change password, and leave space for future notification and export settings."
        onSignOut={() => onNavigate("login")}
      />

      <div className="detail-layout single-column">
        <form className="workspace-card form-card" onSubmit={saveProfile}>
          <span className="eyebrow">Profile</span>
          <div className="field-grid">
            <label>
              Name
              <input type="text" value={profile.name} onInput={(event) => setProfile({ ...profile, name: event.currentTarget.value })} />
            </label>
            <label>
              Date of Birth
              <input type="date" value={profile.dob} onInput={(event) => setProfile({ ...profile, dob: event.currentTarget.value })} />
            </label>
            <label>
              Gender
              <select value={profile.gender} onChange={(event) => setProfile({ ...profile, gender: event.currentTarget.value })}>
                {genderOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>
              Blood Group
              <select value={profile.bloodGroup} onChange={(event) => setProfile({ ...profile, bloodGroup: event.currentTarget.value })}>
                {bloodGroups.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <button type="submit" className="primary-button compact">Save profile</button>
        </form>

        <form className="workspace-card form-card" onSubmit={savePassword}>
          <span className="eyebrow">Change Password</span>
          <div className="field-grid single-col">
            <label>
              Current Password
              <input type="password" value={passwordForm.current} onInput={(event) => setPasswordForm({ ...passwordForm, current: event.currentTarget.value })} />
            </label>
            <label>
              New Password
              <input type="password" value={passwordForm.next} onInput={(event) => setPasswordForm({ ...passwordForm, next: event.currentTarget.value })} />
            </label>
            <label>
              Confirm Password
              <input type="password" value={passwordForm.confirm} onInput={(event) => setPasswordForm({ ...passwordForm, confirm: event.currentTarget.value })} />
            </label>
          </div>
          <button type="submit" className="primary-button compact">Update password</button>
        </form>

        <div className="workspace-card helper-card future-card">
          <span className="eyebrow">Future Settings</span>
          <p>Notification preferences and data export controls can be added here later without changing the current page flow.</p>
        </div>
      </div>
    </section>
  );
}

function VitalsLogPage({ onCreateVital, onNavigate, setToast }) {
  const [form, setForm] = useState({
    checkedAt: currentDateTimeValue(),
    systolic: "",
    diastolic: "",
    heartRate: "",
    notes: "",
  });

  function submitVital(event) {
    event.preventDefault();
    onCreateVital({
      ...form,
      systolic: Number(form.systolic),
      diastolic: Number(form.diastolic),
      heartRate: Number(form.heartRate),
    });
    setToast("Vitals check saved");
    setForm({
      checkedAt: currentDateTimeValue(),
      systolic: "",
      diastolic: "",
      heartRate: "",
      notes: "",
    });
    onNavigate("vitals-report");
  }

  return (
    <section className="workspace-page">
      <DashboardHeader
        title="Vitals Check-in"
        subtitle="Log blood pressure and heart rate with the exact check time so each reading appears in your report history."
        onSignOut={() => onNavigate("login")}
      />

      <form className="workspace-card form-card compact-form" onSubmit={submitVital}>
        <div className="field-grid">
          <label>
            Check Date & Time
            <input type="datetime-local" required value={form.checkedAt} onInput={(event) => setForm({ ...form, checkedAt: event.currentTarget.value })} />
          </label>
          <label>
            Systolic (mmHg)
            <input type="number" min="70" max="250" required value={form.systolic} onInput={(event) => setForm({ ...form, systolic: event.currentTarget.value })} />
          </label>
          <label>
            Diastolic (mmHg)
            <input type="number" min="40" max="150" required value={form.diastolic} onInput={(event) => setForm({ ...form, diastolic: event.currentTarget.value })} />
          </label>
          <label>
            Heart Rate (bpm)
            <input type="number" min="30" max="220" required value={form.heartRate} onInput={(event) => setForm({ ...form, heartRate: event.currentTarget.value })} />
          </label>
        </div>

        <label>
          Notes
          <textarea rows="4" value={form.notes} onInput={(event) => setForm({ ...form, notes: event.currentTarget.value })} placeholder="Optional context like resting, after walk, before medication" />
        </label>

        <button className="primary-button" type="submit">Save vitals reading</button>
      </form>
    </section>
  );
}

function VitalsReportPage({ vitals, onNavigate }) {
  const sortedVitals = [...vitals].sort((left, right) => new Date(right.checkedAt).getTime() - new Date(left.checkedAt).getTime());
  const latest = sortedVitals[0] || null;

  const avgSystolic = Math.round(average(vitals.map((item) => item.systolic)));
  const avgDiastolic = Math.round(average(vitals.map((item) => item.diastolic)));
  const avgHeartRate = Math.round(average(vitals.map((item) => item.heartRate)));

  return (
    <section className="workspace-page">
      <DashboardHeader
        title="Vitals Report"
        subtitle="Review when you checked blood pressure and heart rate, with latest values and simple averages."
        onSignOut={() => onNavigate("login")}
      />

      <div className="detail-layout single-column">
        <div className="workspace-card vitals-summary-grid">
          <div className="metric-tile">
            <strong>Latest BP</strong>
            <span>{latest ? `${latest.systolic}/${latest.diastolic} mmHg` : "No data"}</span>
          </div>
          <div className="metric-tile">
            <strong>Latest Heart Rate</strong>
            <span>{latest ? `${latest.heartRate} bpm` : "No data"}</span>
          </div>
          <div className="metric-tile">
            <strong>Average BP</strong>
            <span>{vitals.length ? `${avgSystolic}/${avgDiastolic} mmHg` : "No data"}</span>
          </div>
          <div className="metric-tile">
            <strong>Average Heart Rate</strong>
            <span>{vitals.length ? `${avgHeartRate} bpm` : "No data"}</span>
          </div>
        </div>

        <div className="workspace-card">
          <div className="card-top-row">
            <div>
              <span className="eyebrow">Report Timeline</span>
              <h2>Blood Pressure & Heart Rate Logs</h2>
            </div>
            <button type="button" className="ghost-button" onClick={() => onNavigate("vitals-log")}>Add new check</button>
          </div>

          {!sortedVitals.length ? (
            <div className="empty-state">No vitals checks yet. Add your first blood pressure and heart rate reading.</div>
          ) : (
            <div className="table-wrap vitals-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Checked At</th>
                    <th>Blood Pressure</th>
                    <th>Heart Rate</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedVitals.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDateTime(item.checkedAt)}</td>
                      <td>{item.systolic}/{item.diastolic} mmHg</td>
                      <td>{item.heartRate} bpm</td>
                      <td>{item.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function WorkspaceShell({ onSignOut }) {
  const [page, setPage] = useState("timeline");
  const [toast, setToast] = useToastState();
  const [visits, setVisits] = useState(initialVisits);
  const [reports, setReports] = useState(initialReports);
  const [symptoms, setSymptoms] = useState(initialSymptoms);
  const [vitals, setVitals] = useState(initialVitals);
  const [suggestion, setSuggestion] = useState(initialSuggestion);
  const [profile, setProfile] = useState(initialProfile);
  const [selectedVisitId, setSelectedVisitId] = useState(initialVisits[0]?.id || "");
  const [selectedReportId, setSelectedReportId] = useState(initialReports[0]?.id || "");
  const [selectedSymptomName, setSelectedSymptomName] = useState(initialSymptoms[0]?.name || "");

  function navigateTo(nextPage, entityId) {
    if (nextPage === "login") {
      onSignOut();
      return;
    }

    if (nextPage === "visit-detail" && entityId) {
      setSelectedVisitId(entityId);
    }

    if (nextPage === "report-detail" && entityId) {
      setSelectedReportId(entityId);
    }

    if (nextPage === "symptoms-history" && entityId) {
      setSelectedSymptomName(entityId);
    }

    setPage(nextPage);
  }

  function openEntry(entry) {
    if (entry.type === "Visit") {
      setSelectedVisitId(entry.id);
      setPage("visit-detail");
      return;
    }

    if (entry.type === "Report") {
      setSelectedReportId(entry.id);
      setPage("report-detail");
      return;
    }

    if (entry.type === "Vitals") {
      setPage("vitals-report");
      return;
    }

    setSelectedSymptomName(entry.title);
    setPage("symptoms-history");
  }

  function createVisit(form) {
    const file = form.prescriptionFile;
    const visitId = createId("visit");
    const hasAttachment = Boolean(file);

    const visit = {
      id: visitId,
      visitDate: form.visitDate,
      doctorName: form.doctorName,
      clinic: form.clinic,
      specialization: form.specialization,
      chiefComplaint: form.chiefComplaint,
      diagnosis: "Pending review",
      notes: form.additionalNotes,
      processing: hasAttachment,
      prescriptionFile: file,
      medications: hasAttachment
        ? []
        : [
            { id: createId("med"), name: "Hydration", dose: "-", frequency: "As needed", duration: "1 week" },
          ],
      testsOrdered: hasAttachment ? [] : [{ id: createId("test"), name: "Follow-up call", linkedReportId: null }],
    };

    setVisits((current) => [visit, ...current]);
    setSelectedVisitId(visitId);
    setPage("visit-detail");

    if (hasAttachment) {
      // Simulate the asynchronous Celery parsing pass so the banner resolves into auto-filled data.
      window.setTimeout(() => {
        setVisits((current) => current.map((item) => {
          if (item.id !== visitId) return item;
          return {
            ...item,
            processing: false,
            diagnosis: "Auto-filled after prescription parsing",
            medications: [
              { id: createId("med"), name: "Amoxicillin", dose: "500 mg", frequency: "Twice daily", duration: "7 days" },
              { id: createId("med"), name: "Paracetamol", dose: "650 mg", frequency: "As needed", duration: "5 days" },
            ],
            testsOrdered: [
              { id: createId("test"), name: "CBC", linkedReportId: null },
              { id: createId("test"), name: "ECG", linkedReportId: reports[0]?.id || null },
            ],
          };
        }));
        setToast("Prescription processed and medications populated");
      }, 1800);
    }
  }

  function updateVisit(visitId, nextVisit) {
    setVisits((current) => current.map((item) => (item.id === visitId ? { ...item, ...nextVisit } : item)));
  }

  function deleteVisit(visitId) {
    setVisits((current) => current.filter((item) => item.id !== visitId));
    const nextVisit = visits.find((item) => item.id !== visitId);
    setSelectedVisitId(nextVisit?.id || "");
  }

  function createReport(form) {
    const file = form.file;
    const reportId = createId("report");
    const report = {
      id: reportId,
      testType: form.testType,
      reportDate: form.reportDate,
      linkedVisitId: form.linkedVisitId || null,
      notes: form.notes,
      processing: true,
      file,
      metrics: {},
      summary: "",
    };

    setReports((current) => [report, ...current]);
    setSelectedReportId(reportId);
    setPage("report-detail");

    window.setTimeout(() => {
      setReports((current) => current.map((item) => {
        if (item.id !== reportId) return item;
        return {
          ...item,
          processing: false,
          metrics: {
            WBC: "7.1 x10^9/L",
            Hemoglobin: "13.8 g/dL",
            Platelets: "241 x10^9/L",
            CRP: "2.1 mg/L",
          },
          summary: "The parsed report is within expected limits, with no urgent abnormalities highlighted by the AI extract.",
        };
      }));
      setToast("Report parsed and metrics populated");
    }, 1800);
  }

  function deleteReport(reportId) {
    setReports((current) => current.filter((item) => item.id !== reportId));
    const nextReport = reports.find((item) => item.id !== reportId);
    setSelectedReportId(nextReport?.id || "");
  }

  function createSymptom(form) {
    const symptom = {
      id: createId("symptom"),
      name: form.name,
      severity: Number(form.severity),
      dateTime: form.dateTime,
      notes: form.notes,
    };

    setSymptoms((current) => [symptom, ...current]);
    setSelectedSymptomName(symptom.name);
  }

  function createVital(form) {
    const vital = {
      id: createId("vitals"),
      checkedAt: form.checkedAt,
      systolic: Number(form.systolic),
      diastolic: Number(form.diastolic),
      heartRate: Number(form.heartRate),
      notes: form.notes,
    };

    setVitals((current) => [vital, ...current]);
  }

  function regenerateSuggestion() {
    setSuggestion(buildSuggestion());
    setToast("AI suggestion regenerated");
  }

  const activePage = (() => {
    if (page === "timeline") {
      return <TimelinePage visits={visits} reports={reports} symptoms={symptoms} vitals={vitals} onOpenEntry={openEntry} onSignOut={navigateTo} />;
    }

    if (page === "log-visit") {
      return <VisitFormPage onCreateVisit={createVisit} onNavigate={navigateTo} setToast={setToast} />;
    }

    if (page === "visit-detail") {
      return <VisitDetailPage visits={visits} reports={reports} selectedVisitId={selectedVisitId} onUpdateVisit={updateVisit} onDeleteVisit={deleteVisit} onNavigate={navigateTo} setToast={setToast} />;
    }

    if (page === "upload-report") {
      return <ReportFormPage visits={visits} onCreateReport={createReport} onNavigate={navigateTo} setToast={setToast} />;
    }

    if (page === "report-detail") {
      return <ReportDetailPage reports={reports} visits={visits} selectedReportId={selectedReportId} onDeleteReport={deleteReport} onNavigate={navigateTo} setToast={setToast} />;
    }

    if (page === "vitals-log") {
      return <VitalsLogPage onCreateVital={createVital} onNavigate={navigateTo} setToast={setToast} />;
    }

    if (page === "vitals-report") {
      return <VitalsReportPage vitals={vitals} onNavigate={navigateTo} />;
    }

    if (page === "log-symptom") {
      return <LogSymptomPage onCreateSymptom={createSymptom} onNavigate={navigateTo} setToast={setToast} />;
    }

    if (page === "symptoms-history") {
      return <SymptomsHistoryPage symptoms={symptoms} onNavigate={navigateTo} setSelectedSymptomName={setSelectedSymptomName} />;
    }

    if (page === "ai-suggestions") {
      return <AISuggestionsPage suggestion={suggestion} onRegenerate={regenerateSuggestion} onNavigate={navigateTo} />;
    }

    if (page === "profile-settings") {
      return <ProfileSettingsPage profile={profile} setProfile={setProfile} onNavigate={navigateTo} setToast={setToast} />;
    }

    return null;
  })();

  return (
    <main className="workspace-shell">
      <div className="workspace-nav-wrap">
        <div className="workspace-brand">
          <span className="brand-mark">MD</span>
          <div>
            <strong>MediLog</strong>
            <p>Clinical timeline, records, and AI guidance in one place.</p>
          </div>
        </div>

        <nav className="workspace-nav" aria-label="Workspace pages">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={page === item.id ? "active" : ""}
              onClick={() => navigateTo(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {activePage}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

export default function MediLogApp() {
  const [page, setPage] = useState("login");
  const [toast, setToast] = useState("");

  function showToast(message) {
    setToast(message);
  }

  function handleLogin(event) {
    event.preventDefault();
    setPage("workspace");
    showToast("Signed in successfully");
  }

  function handleRegister(event) {
    event.preventDefault();
    setPage("workspace");
    showToast("Account created successfully");
  }

  if (page === "workspace") {
    return <WorkspaceShell onSignOut={() => setPage("login")} />;
  }

  return (
    <main className="auth-shell">
      <HeroSlider mode={page} />

      <section className="form-panel" aria-label="Account access">
        {page === "login" ? (
          <LoginCard onSwitch={() => setPage("register")} onSubmit={handleLogin} />
        ) : (
          <RegisterCard onSwitch={() => setPage("login")} onSubmit={handleRegister} />
        )}
      </section>

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}