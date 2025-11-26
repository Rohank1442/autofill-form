"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="p-4 shadow flex gap-6 bg-white border-b">
      <Link href="/">Home</Link>
      <Link href="/upload">Upload Resume</Link>
      <Link href="/form">Paste Form</Link>
      <Link href="/generate">Generate Answers</Link>
    </nav>
  );
}
