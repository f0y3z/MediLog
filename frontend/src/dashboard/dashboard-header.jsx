export default function DashboardHeader({ title, subtitle, onSignOut }) {
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