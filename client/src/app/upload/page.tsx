"use client";
import { useState } from "react";
import { uploadResume, saveUserProfile } from "../../lib/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savedUserId, setSavedUserId] = useState<number | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const data = await uploadResume(file);
    setResumeText(data.resume_text || "");
  };

  const handleSave = async () => {
    const profileData = {
      full_name: fullName,
      email,
      phone,
      resume_text: resumeText,
    };
    const saved = await saveUserProfile(profileData);
    setSavedUserId(saved.id);
    alert("Profile saved successfully!");
  };

  return (
    <div>
      <h1>Upload Resume</h1>
      <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload}>Upload & Extract</button>

      {resumeText && (
        <div>
          <h2>Edit Extracted Data</h2>
          <input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={10} cols={50} />
          <button onClick={handleSave}>Save Profile</button>
        </div>
      )}

      {savedUserId && <p>Saved user ID: {savedUserId}</p>}
    </div>
  );
}
