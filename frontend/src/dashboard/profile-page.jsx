import { useState } from "preact/hooks";
import { bloodGroups, genderOptions } from "../medilog-data.js";
import DashboardHeader from "./dashboard-header.jsx";

export default function ProfileSettingsPage({ profile, setProfile, onNavigate, setToast }) {
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });

  function saveProfile(event) {
    event.preventDefault();
    setToast("Profile updated");
  }

  function savePassword(event) {
    event.preventDefault();
    setToast("Password change saved for demo purposes");
    setPasswordForm({ current: "", next: "", confirm: "" });
  }

  return (
    <section className="workspace-page">
      <DashboardHeader
        title="Profile & Settings"
        subtitle="View and edit your profile, change password, and leave space for future notification and export settings."
        onSignOut={() => onNavigate("login")}
      />

      <div className="detail-layout single-column">
        <form className="workspace-card form-card" onSubmit={saveProfile}>
          <span className="eyebrow">Profile</span>
          <div className="field-grid">
            <label>
              Name
              <input type="text" value={profile.name} onInput={(event) => setProfile({ ...profile, name: event.currentTarget.value })} />
            </label>
            <label>
              Date of Birth
              <input type="date" value={profile.dob} onInput={(event) => setProfile({ ...profile, dob: event.currentTarget.value })} />
            </label>
            <label>
              Gender
              <select value={profile.gender} onChange={(event) => setProfile({ ...profile, gender: event.currentTarget.value })}>
                {genderOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>
              Blood Group
              <select value={profile.bloodGroup} onChange={(event) => setProfile({ ...profile, bloodGroup: event.currentTarget.value })}>
                {bloodGroups.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <button type="submit" className="primary-button compact">Save profile</button>
        </form>

        <form className="workspace-card form-card" onSubmit={savePassword}>
          <span className="eyebrow">Change Password</span>
          <div className="field-grid single-col">
            <label>
              Current Password
              <input type="password" value={passwordForm.current} onInput={(event) => setPasswordForm({ ...passwordForm, current: event.currentTarget.value })} />
            </label>
            <label>
              New Password
              <input type="password" value={passwordForm.next} onInput={(event) => setPasswordForm({ ...passwordForm, next: event.currentTarget.value })} />
            </label>
            <label>
              Confirm Password
              <input type="password" value={passwordForm.confirm} onInput={(event) => setPasswordForm({ ...passwordForm, confirm: event.currentTarget.value })} />
            </label>
          </div>
          <button type="submit" className="primary-button compact">Update password</button>
        </form>

        <div className="workspace-card helper-card future-card">
          <span className="eyebrow">Future Settings</span>
          <p>Notification preferences and data export controls can be added here later without changing the current page flow.</p>
        </div>
      </div>
    </section>
  );
}