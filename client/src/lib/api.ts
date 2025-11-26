export const UPLOAD_URL = "http://127.0.0.1:8000/upload/";
export const USER_URL = "http://127.0.0.1:8000/api/v1/user";

export async function uploadResume(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function saveUserProfile(profile: any) {
  const res = await fetch(USER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  return res.json();
}
