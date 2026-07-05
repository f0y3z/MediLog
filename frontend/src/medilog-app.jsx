import { useState } from "preact/hooks";
import LoginShell from "./login.jsx";
import WorkspaceShell from "./dashboard.jsx";
import {
  initialProfile,
  initialReports,
  initialSuggestion,
  initialSymptoms,
  initialVitals,
  initialVisits,
} from "./medilog-data.js";

export default function MediLogApp() {
  const [page, setPage] = useState("login");
  const [visits, setVisits] = useState(initialVisits);
  const [reports, setReports] = useState(initialReports);
  const [symptoms, setSymptoms] = useState(initialSymptoms);
  const [vitals, setVitals] = useState(initialVitals);
  const [suggestion, setSuggestion] = useState(initialSuggestion);
  const [profile, setProfile] = useState(initialProfile);

  if (page === "workspace") {
    return (
      <WorkspaceShell
        onSignOut={() => setPage("login")}
        visits={visits}
        setVisits={setVisits}
        reports={reports}
        setReports={setReports}
        symptoms={symptoms}
        setSymptoms={setSymptoms}
        vitals={vitals}
        setVitals={setVitals}
        suggestion={suggestion}
        setSuggestion={setSuggestion}
        profile={profile}
        setProfile={setProfile}
      />
    );
  }

  return <LoginShell onAuthenticated={() => setPage("workspace")} />;
}