import { useState } from "preact/hooks";
import {
  average,
  currentDateTimeValue,
  formatDateTime,
} from "../medilog-data.js";
import DashboardHeader from "./dashboard-header.jsx";

// Vitals pages: add blood pressure checks and show the calculated report table.
export function VitalsLogPage({ onCreateVital, onNavigate, setToast }) {
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

export function VitalsReportPage({ vitals, onNavigate }) {
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
