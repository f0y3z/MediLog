import { useEffect, useState } from "preact/hooks";
import { postJson } from "./api.js";
import { slides, strengthMeta } from "./medilog-data.js";

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
      <div className="brand-row"></div>

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
          <div className="feature">
            <span className="feature-icon clinic" />
            <strong>Primary Care</strong>
          </div>
          <div className="feature">
            <span className="feature-icon plan" />
            <strong>Specialist Support</strong>
          </div>
          <div className="feature">
            <span className="feature-icon track" />
            <strong>Track & Follow Up</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function AuthHeader({ title, text }) {
  return (
    <div className="auth-header">
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function LoginCard({ onSwitch, onSubmit, error, isSubmitting }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({ email, password });
  }

  return (
    <div className="auth-card">
      <AuthHeader
        title="Welcome Back"
        text="Sign in to manage appointments, records, medications, and wellness plans."
      />

      <form onSubmit={handleSubmit}>
        <label>
          <div className="field-control">
            <span className="field-icon"></span>
            <input type="email" placeholder="Enter your email" value={email} onInput={(event) => setEmail(event.currentTarget.value)} required />
          </div>
        </label>

        <label>
          <PasswordInput
            placeholder="Enter your password"
            value={password}
            onInput={(event) => setPassword(event.currentTarget.value)}
          />
        </label>

        {error && <small className="error-message">{error}</small>}

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing In..." : <>Sign In <span>→</span></>}
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

function RegisterCard({ onSwitch, onSubmit, error, isSubmitting }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const meta = strengthMeta(password);

  async function handleSubmit(event) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    setLocalError("");
    await onSubmit({ firstName, lastName, email, phone, password });
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
              <input type="text" placeholder="First name" value={firstName} onInput={(event) => setFirstName(event.currentTarget.value)} required />
            </div>
          </label>
          <label>
            <div className="field-control">
              <input type="text" placeholder="Last name" value={lastName} onInput={(event) => setLastName(event.currentTarget.value)} required />
            </div>
          </label>
        </div>

        <label>
          <div className="field-control">
            <input type="email" placeholder="Enter your email" value={email} onInput={(event) => setEmail(event.currentTarget.value)} required />
          </div>
        </label>

        <label>
          <div className="field-control">
            <input type="tel" placeholder="+880 1xxx-xxxxxx" value={phone} onInput={(event) => setPhone(event.currentTarget.value)} />
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
              if (localError) setLocalError("");
            }}
          />
          {(localError || error) && <small className="error-message">{localError || error}</small>}
        </label>

        <label className="check-row">
          <input type="checkbox" required />
          <span>I agree to the Terms and Privacy Policy</span>
        </label>

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : <>Create Account <span>→</span></>}
        </button>
      </form>

      <p className="switch-copy">
        Already have an account?
        <button type="button" onClick={onSwitch}>Sign in</button>
      </p>
    </div>
  );
}

export default function LoginShell({ onAuthenticated, setToast }) {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(payload) {
    setIsSubmitting(true);
    setError("");

    try {
      await postJson("/auth/login", payload);
      setToast?.("Signed in successfully");
      onAuthenticated();
    } catch (requestError) {
      setError(requestError.message || "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(payload) {
    setIsSubmitting(true);
    setError("");

    try {
      await postJson("/auth/register", payload);
      setToast?.("Account created successfully");
      onAuthenticated();
    } catch (requestError) {
      setError(requestError.message || "Unable to create account");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <HeroSlider mode={mode} />

      <section className="form-panel" aria-label="Account access">
        {mode === "login" ? (
          <LoginCard
            onSwitch={() => {
              setError("");
              setMode("register");
            }}
            onSubmit={handleLogin}
            error={error}
            isSubmitting={isSubmitting}
          />
        ) : (
          <RegisterCard
            onSwitch={() => {
              setError("");
              setMode("login");
            }}
            onSubmit={handleRegister}
            error={error}
            isSubmitting={isSubmitting}
          />
        )}
      </section>
    </main>
  );
}