import { useState } from "preact/hooks";
import { buildSuggestion, createId, navItems } from "./medilog-data.js";
import { TimelinePage } from "./timeline.jsx";
import AISuggestionsPage from "./dashboard/ai-suggestions-page.jsx";
import ProfileSettingsPage from "./dashboard/profile-page.jsx";
import { ReportDetailPage, ReportFormPage } from "./dashboard/report-pages.jsx";
import { LogSymptomPage, SymptomsHistoryPage } from "./dashboard/symptom-pages.jsx";
import useToastState from "./dashboard/use-toast-state.js";
import { VisitDetailPage, VisitFormPage } from "./dashboard/visit-pages.jsx";
import { VitalsLogPage, VitalsReportPage } from "./dashboard/vitals-pages.jsx";

// Dashboard shell: page UI lives in src/dashboard/*.jsx.
// This file only owns navigation, selected item ids, and shared data updates.
function WorkspaceShell({
  onSignOut,
  visits,
  setVisits,
  reports,
  setReports,
  symptoms,
  setSymptoms,
  vitals,
  setVitals,
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

    if (entry.type === "Vitals") {
      setPage("vitals-report");
      return;
    }

    setSelectedSymptomName(entry.title);
    setPage("symptoms-history");
  }

  // Demo save flow: add the visit immediately, then mimic prescription parsing.
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

  // Demo save flow: show upload first, then fill parsed metrics after a delay.
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

  // Page router: add new dashboard screens here after creating their component file.
  const activePage = (() => {
    if (page === "timeline") {
      return <TimelinePage visits={visits} reports={reports} symptoms={symptoms} vitals={vitals} onOpenEntry={openEntry} onSignOut={() => navigateTo("login")} />;
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

export default WorkspaceShell;
