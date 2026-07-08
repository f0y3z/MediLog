import { useEffect, useState } from "preact/hooks";
import { apiRequest, deleteResource, mapReport, mapSymptom, mapVisit, patchJson, postForm, postJson } from "./api.js";
import { navItems } from "./medilog-data.js";
import { TimelinePage } from "./timeline.jsx";
import AISuggestionsPage from "./dashboard/ai-suggestions-page.jsx";
import ProfileSettingsPage from "./dashboard/profile-page.jsx";
import { ReportDetailPage, ReportFormPage } from "./dashboard/report-pages.jsx";
import { LogSymptomPage, SymptomsHistoryPage } from "./dashboard/symptom-pages.jsx";
import useToastState from "./dashboard/use-toast-state.js";
import { VisitDetailPage, VisitFormPage } from "./dashboard/visit-pages.jsx";

// Dashboard shell: page UI lives in src/dashboard/*.jsx.
// This file only owns navigation, selected item ids, and shared data updates.
function WorkspaceShell({
  onSignOut,
  onRefresh,
  isLoading,
  loadError,
  visits,
  setVisits,
  reports,
  setReports,
  symptoms,
  setSymptoms,
  timeline,
  setTimeline,
  suggestion,
  setSuggestion,
  profile,
  setProfile,
}) {
  const [page, setPage] = useState("timeline");
  const [toast, setToast] = useToastState();
  const [selectedVisitId, setSelectedVisitId] = useState(visits[0]?.id || "");
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id || "");
  const [selectedSymptomName, setSelectedSymptomName] = useState(symptoms[0]?.name || "");

  useEffect(() => {
    if (!selectedVisitId && visits[0]) setSelectedVisitId(visits[0].id);
  }, [visits, selectedVisitId]);

  useEffect(() => {
    if (!selectedReportId && reports[0]) setSelectedReportId(reports[0].id);
  }, [reports, selectedReportId]);

  useEffect(() => {
    if (!selectedSymptomName && symptoms[0]) setSelectedSymptomName(symptoms[0].name);
  }, [symptoms, selectedSymptomName]);

  // One navigation helper keeps page changes and selected records together.
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

  // Timeline entries are generic cards, so this maps a card click to its detail page.
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

    setSelectedSymptomName(entry.title);
    setPage("symptoms-history");
  }

  async function createVisit(form) {
    const payload = new FormData();
    payload.append("doctor_name", form.doctorName);
    payload.append("clinic_or_hospital", form.clinic);
    payload.append("specialization", form.specialization);
    payload.append("chief_complaint", form.chiefComplaint);
    payload.append("doctor_notes", form.additionalNotes || "");
    if (form.prescriptionFile) payload.append("prescription_file", form.prescriptionFile);

    const created = mapVisit(await postForm("/visits/", payload));
    setVisits((current) => [created, ...current]);
    setSelectedVisitId(created.id);
    setPage("visit-detail");
    await onRefresh();
    setToast("Doctor visit saved");
  }

  async function updateVisit(visitId, nextVisit) {
    const updated = mapVisit(await patchJson(`/visits/${visitId}/`, {
      doctor_name: nextVisit.doctorName,
      clinic_or_hospital: nextVisit.clinic,
      specialization: nextVisit.specialization,
      chief_complaint: nextVisit.chiefComplaint,
      doctor_notes: nextVisit.notes,
    }));
    setVisits((current) => current.map((item) => (item.id === visitId ? updated : item)));
    setToast("Visit updated");
  }

  async function deleteVisit(visitId) {
    await deleteResource(`/visits/${visitId}/`);
    setVisits((current) => current.filter((item) => item.id !== visitId));
    const nextVisit = visits.find((item) => item.id !== visitId);
    setSelectedVisitId(nextVisit?.id || "");
    await onRefresh();
    setToast("Visit deleted");
  }

  async function createReport(form) {
    const payload = new FormData();
    payload.append("test_type", form.testType);
    payload.append("report_date", form.reportDate);
    payload.append("notes", form.notes || "");
    payload.append("file", form.file);
    if (form.linkedVisitId) payload.append("visit", form.linkedVisitId);

    const created = mapReport(await postForm("/reports/", payload));
    setReports((current) => [created, ...current]);
    setSelectedReportId(created.id);
    setPage("report-detail");
    await onRefresh();
    setToast("Lab report uploaded");
  }

  async function deleteReport(reportId) {
    await deleteResource(`/reports/${reportId}/`);
    setReports((current) => current.filter((item) => item.id !== reportId));
    const nextReport = reports.find((item) => item.id !== reportId);
    setSelectedReportId(nextReport?.id || "");
    await onRefresh();
    setToast("Report deleted");
  }

  async function createSymptom(form) {
    const symptom = mapSymptom(await postJson("/symptoms/", {
      symptom_name: form.name,
      severity: Number(form.severity),
      notes: form.notes,
    }));
    setSymptoms((current) => [symptom, ...current]);
    setSelectedSymptomName(symptom.name);
    await onRefresh();
    setToast("Symptom logged");
  }

  async function regenerateSuggestion() {
    const analysis = await apiRequest("/intelligence/analyze/", { method: "POST" });
    setSuggestion({ ...analysis, generatedAt: new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) });
    setToast("AI analysis generated");
  }

  // Page router: add new dashboard screens here after creating their component file.
  const activePage = (() => {
    if (page === "timeline") {
      return <TimelinePage visits={visits} reports={reports} symptoms={symptoms} timeline={timeline} onOpenEntry={openEntry} onSignOut={() => navigateTo("login")} />;
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
      setPage("timeline");
      return null;
    }

    if (page === "vitals-report") {
      setPage("timeline");
      return null;
    }

    if (page === "log-symptom") {
      return <LogSymptomPage onCreateSymptom={createSymptom} onNavigate={navigateTo} setToast={setToast} />;
    }

    if (page === "symptoms-history") {
      return <SymptomsHistoryPage symptoms={symptoms} onNavigate={navigateTo} setSelectedSymptomName={setSelectedSymptomName} />;
    }

    if (page === "ai-suggestions") {
      return <AISuggestionsPage suggestion={suggestion} onRegenerate={regenerateSuggestion} onNavigate={navigateTo} setToast={setToast} />;
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

      {isLoading && <div className="toast">Loading backend data...</div>}
      {loadError && <div className="toast error-toast">{loadError}</div>}
      {activePage}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

export default WorkspaceShell;
