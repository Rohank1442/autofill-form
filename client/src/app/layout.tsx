export const metadata = {
  title: "Autofill AI",
  description: "AI powered form autofill extension",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
