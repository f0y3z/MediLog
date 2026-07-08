import { useEffect, useState } from "preact/hooks";
import {
  createId,
  currentDateValue,
  formatDate,
  specializationOptions,
} from "../medilog-data.js";
import DashboardHeader from "./dashboard-header.jsx";

// Visit pages: create visits and edit the selected visit/prescription details.
export function VisitDetailPage({ visits, reports, selectedVisitId, onUpdateVisit, onDeleteVisit, onNavigate, setToast }) {
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

  async function saveVisit(event) {
    event.preventDefault();
    await onUpdateVisit(visit.id, draft);
    setEditorOpen(false);
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

  async function deleteVisit() {
    await onDeleteVisit(visit.id);
    onNavigate("timeline");
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
                  <img src={visit.prescriptionFile.url} alt={visit.prescriptionFile.name} />
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
                      <td><input value={medication.name} onInput={(event) => updateMedication(medication.id, "name", event.currentTarget.value)} disabled /></td>
                      <td><input value={medication.dose} onInput={(event) => updateMedication(medication.id, "dose", event.currentTarget.value)} disabled /></td>
                      <td><input value={medication.frequency} onInput={(event) => updateMedication(medication.id, "frequency", event.currentTarget.value)} disabled /></td>
                      <td><input value={medication.duration} onInput={(event) => updateMedication(medication.id, "duration", event.currentTarget.value)} disabled /></td>
                      <td>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => setDraft({ ...draft, medications: draft.medications.filter((item) => item.id !== medication.id) })}
                          disabled
                        >
                          Parsed
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="add-row disabled-row">
              <input placeholder="Medication name" value={medicationDraft.name} onInput={(event) => setMedicationDraft({ ...medicationDraft, name: event.currentTarget.value })} />
              <input placeholder="Dose" value={medicationDraft.dose} onInput={(event) => setMedicationDraft({ ...medicationDraft, dose: event.currentTarget.value })} />
              <input placeholder="Frequency" value={medicationDraft.frequency} onInput={(event) => setMedicationDraft({ ...medicationDraft, frequency: event.currentTarget.value })} />
              <input placeholder="Duration" value={medicationDraft.duration} onInput={(event) => setMedicationDraft({ ...medicationDraft, duration: event.currentTarget.value })} />
              <button type="button" className="primary-button compact" onClick={addMedication} disabled>Parsed only</button>
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

export function VisitFormPage({ onCreateVisit, onNavigate, setToast }) {
  const [form, setForm] = useState({
    visitDate: currentDateValue(),
    doctorName: "",
    clinic: "",
    specialization: "GP",
    chiefComplaint: "",
    additionalNotes: "",
    prescriptionFile: null,
  });

  async function submitVisit(event) {
    event.preventDefault();
    await onCreateVisit(form);
    setForm({
      visitDate: currentDateValue(),
      doctorName: "",
      clinic: "",
      specialization: "GP",
      chiefComplaint: "",
      additionalNotes: "",
      prescriptionFile: null,
    });
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
            onChange={(event) => setForm({ ...form, prescriptionFile: event.currentTarget.files?.[0] || null })}
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
