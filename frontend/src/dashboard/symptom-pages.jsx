import { useState } from "preact/hooks";
import {
  buildSymptomTrend,
  currentDateTimeValue,
  formatDateTime,
} from "../medilog-data.js";
import DashboardHeader from "./dashboard-header.jsx";

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

export function LogSymptomPage({ onCreateSymptom, onNavigate, setToast }) {
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

export function SymptomsHistoryPage({ symptoms, onNavigate, setSelectedSymptomName }) {
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