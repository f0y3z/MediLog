import { useEffect, useState } from "preact/hooks";
import { clearSession, fetchWorkspaceData, hasSession, safeErrorMessage } from "./api.js";
import LoginShell from "./login.jsx";
import WorkspaceShell from "./dashboard.jsx";
import {
  initialProfile,
} from "./medilog-data.js";

export default function MediLogApp() {
  const [page, setPage] = useState(hasSession() ? "workspace" : "login");
  const [visits, setVisits] = useState([]);
  const [reports, setReports] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [suggestion, setSuggestion] = useState(null);
  const [profile, setProfile] = useState(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  async function refreshWorkspace() {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await fetchWorkspaceData();
      setVisits(data.visits);
      setReports(data.reports);
      setSymptoms(data.symptoms);
      setTimeline(data.timeline);
      if (data.profile) setProfile(data.profile);
    } catch (error) {
      if (error.status === 401) {
        clearSession();
        setPage("login");
        return;
      }
      setLoadError(safeErrorMessage(error, "Unable to load workspace data."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (page === "workspace") refreshWorkspace();
  }, [page]);

  function signOut() {
    clearSession();
    setPage("login");
    setVisits([]);
    setReports([]);
    setSymptoms([]);
    setTimeline([]);
    setSuggestion(null);
  }

  if (page === "workspace") {
    return (
      <WorkspaceShell
        onSignOut={signOut}
        onRefresh={refreshWorkspace}
        isLoading={isLoading}
        loadError={loadError}
        visits={visits}
        setVisits={setVisits}
        reports={reports}
        setReports={setReports}
        symptoms={symptoms}
        setSymptoms={setSymptoms}
        timeline={timeline}
        setTimeline={setTimeline}
        suggestion={suggestion}
        setSuggestion={setSuggestion}
        profile={profile}
        setProfile={setProfile}
      />
    );
  }

  return <LoginShell onAuthenticated={() => setPage("workspace")} />;
}
