import DashboardHeader from "./dashboard-header.jsx";

// AI suggestions page: displays the generated guidance created by the dashboard shell.
export default function AISuggestionsPage({ suggestion, onRegenerate, onNavigate }) {
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
