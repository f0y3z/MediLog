import { useMemo, useState } from "preact/hooks";
import { formatDate, toTimelineSortValue } from "./medilog-data.js";

export function buildTimelineEntries(visits, reports, symptoms, vitals) {
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

export function TimelinePage({ visits, reports, symptoms, vitals, onOpenEntry, onSignOut }) {
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
        onSignOut={onSignOut}
      />

      <div className="workspace-card">
        <div className="page-toolbar">
          <div className="segmented-controls">
            {["All", "Visit", "Report", "Symptom", "Vitals"].map((item) => (
              <button
                key={item}
                type="button"
                className={filterType === item ? "active" : ""}
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