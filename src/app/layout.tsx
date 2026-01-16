import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Numo",
  description: "App de finanzas creada con Gemini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen w-5/6 mx-auto bg-[var(--color-background)] text-[var(--color-text-primary)] antialiased">
        <div className="sticky top-0 z-50 bg-[var(--color-background)]/80 backdrop-blur-md ">
          <Header />
        </div>

        <main className="flex-grow py-4">
          <div className="w-full h-full">{children}</div>
        </main>
      </body>
    </html>
  );
}
