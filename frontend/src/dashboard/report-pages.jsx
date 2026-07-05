import { useState } from "preact/hooks";
import {
  currentDateValue,
  filePreviewFromFile,
  formatDate,
  testTypeOptions,
} from "../medilog-data.js";
import DashboardHeader from "./dashboard-header.jsx";

export function ReportDetailPage({ reports, visits, selectedReportId, onDeleteReport, onNavigate, setToast }) {
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
                  <img src={report.file.url} alt={report.file.name || "Report preview"} />
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

export function ReportFormPage({ visits, onCreateReport, onNavigate, setToast }) {
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