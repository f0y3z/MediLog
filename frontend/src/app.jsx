import { useEffect, useState } from "preact/hooks";
import healthImageOne from "../healthcare-1.jpg";
import healthImageTwo from "../healthcare-2.png";

const slides = [healthImageOne, healthImageTwo];

const features = [
  { icon: "clinic", label: "Primary Care" },
  { icon: "plan", label: "Specialist Support" },
  { icon: "track", label: "Track & Follow Up" },
];

const healthSummary = {
  totalVisits: 8,
  activeMedications: 3,
  reportsUploaded: 12,
  lastSymptomLogged: "Mild nausea, today 8:15 AM",
};

const latestHealthSuggestion = {
  createdAt: "Today, 8:40 AM",
  early_warnings: [
    "Blood pressure trend is slightly higher than your usual range.",
    "You logged dizziness twice this week. Consider scheduling a check-in.",
  ],
};

const timelineEntries = [
  { type: "Symptom", title: "Mild nausea", detail: "Logged with low severity", time: "Today, 8:15 AM" },
  { type: "Medication", title: "Daily supplement", detail: "Marked as taken", time: "Today, 7:30 AM" },
  { type: "Report", title: "CBC report uploaded", detail: "1 PDF added to records", time: "Yesterday, 6:10 PM" },
  { type: "Visit", title: "Dr. Rahman follow-up", detail: "Next appointment booked", time: "Jun 30, 4:00 PM" },
  { type: "Symptom", title: "Back pain", detail: "Rest and hydration suggested", time: "Jun 29, 9:20 PM" },
];

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
      <div className="brand-row">
        {/* <span className="brand-mark"></span>
        <h1>
          <span>Nurturing</span> <span>New</span> <span>Beginnings</span>
        </h1> */}
      </div>

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
          {features.map((feature) => (
            <div className="feature" key={feature.label}>
              <span className={"feature-icon " + feature.icon} />
              <strong>{feature.label}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AuthHeader({ title, text }) {
  return (
    <div className="auth-header">
      {/* <span className="auth-badge">HI</span> */}
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

                        // ..............DASHBOARD.................

function Dashboard({ onQuickLog, onSignOut }) {
  const warningCount = latestHealthSuggestion.early_warnings.length;
  const stats = [
    { label: "Total Visits", value: healthSummary.totalVisits, detail: "care appointments" },
    { label: "Active Medications", value: healthSummary.activeMedications, detail: "currently tracked" },
    { label: "Reports Uploaded", value: healthSummary.reportsUploaded, detail: "medical files" },
    { label: "Last Symptom Logged", value: healthSummary.lastSymptomLogged, detail: "latest entry" },
  ];

  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Good morning</h1>
          <p>Your health overview is ready. Keep tracking the details that matter most.</p>
        </div>
        <button className="ghost-button" type="button" onClick={onSignOut}>Sign out</button>
      </header>

      <section className="stats-strip" aria-label="Health summary statistics">
        {stats.map((stat) => (
          <article className="stat-tile" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.detail}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className={"health-alert-card " + (warningCount ? "has-warning" : "is-clear")}>
          <div className="card-heading-row">
            <div>
              <span className="eyebrow">AI Health Alert</span>
              <h2>{warningCount ? "Early warnings found" : "No early warnings"}</h2>
            </div>
            <span className="alert-pill">{warningCount ? warningCount + " alert" : "Clear"}</span>
          </div>
          <p className="alert-time">Latest HealthSuggestion: {latestHealthSuggestion.createdAt}</p>
          {warningCount ? (
            <ul className="warning-list">
              {latestHealthSuggestion.early_warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : (
            <p className="clear-copy">No early warning signals were found in the latest health suggestion.</p>
          )}
        </article>

        <article className="quick-log-card">
          <span className="eyebrow">Quick Log</span>
          <h2>Add a new health entry</h2>
          <div className="quick-actions">
            <button type="button" onClick={() => onQuickLog("Symptom")}>+ Symptom</button>
            <button type="button" onClick={() => onQuickLog("Visit")}>+ Visit</button>
            <button type="button" onClick={() => onQuickLog("Report")}>+ Report</button>
          </div>
        </article>

        <article className="timeline-card">
          <div className="card-heading-row">
            <div>
              <span className="eyebrow">Recent Timeline</span>
              <h2>Last 5 entries</h2>
            </div>
          </div>
          <ol className="timeline-list">
            {timelineEntries.map((entry) => (
              <li key={entry.type + entry.time}>
                <span className="timeline-dot" />
                <div>
                  <div className="timeline-meta">
                    <strong>{entry.type}</strong>
                    <time>{entry.time}</time>
                  </div>
                  <h3>{entry.title}</h3>
                  <p>{entry.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>
      </section>
    </main>
  );
}

export default function MediLogApp() {
  const [page, setPage] = useState("login");
  const [toast, setToast] = useState("");

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function handleLogin(event) {
    event.preventDefault();
    setPage("dashboard");
    showToast("Signed in successfully");
  }

  function handleRegister(event) {
    event.preventDefault();
    setPage("dashboard");
    showToast("Account created successfully");
  }

  function handleQuickLog(type) {
    showToast(type + " log opened");
  }

  if (page === "dashboard") {
    return (
      <>
        <Dashboard onQuickLog={handleQuickLog} onSignOut={() => setPage("login")} />
        {toast && <div className="toast">{toast}</div>}
      </>
    );
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
