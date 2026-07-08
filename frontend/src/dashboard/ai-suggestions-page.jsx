import DashboardHeader from "./dashboard-header.jsx";

// AI suggestions page: displays the generated guidance created by the dashboard shell.
export default function AISuggestionsPage({ suggestion, onRegenerate, onNavigate }) {
  async function generate() {
    await onRegenerate();
  }

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
          <button type="button" className="primary-button compact" onClick={generate}>Analyze</button>
        </div>
        <p className="timestamp-copy">Last generated: {suggestion ? suggestion.generatedAt : "No suggestion generated yet"}</p>

        {!suggestion ? (
          <div className="empty-state">Add more health data to generate a personalized AI suggestion.</div>
        ) : (
          <div className="suggestion-grid">
            <article>
              <span className="eyebrow">Risk Level</span>
              <h3>{suggestion.risk_level}</h3>
              <p>{suggestion.plain_summary}</p>
            </article>
            <article>
              <span className="eyebrow">Detected Correlations</span>
              <ul>{(suggestion.detected_correlations || []).map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
            <article>
              <span className="eyebrow">Biomarkers</span>
              <ul>{(suggestion.biomarkers_of_concern || []).map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
            <article className="warning-panel">
              <span className="eyebrow">Early Warnings</span>
              <ul>{(suggestion.early_warning_signs || []).map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
            <article>
              <span className="eyebrow">Recommendations</span>
              <ul>{(suggestion.clinical_recommendations || []).map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          </div>
        )}
      </div>
    </section>
  );
}
