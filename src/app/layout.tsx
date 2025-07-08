// En src/app/layout.tsx (versión corregida con Flexbox)
import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header"; // Asumo que tienes un componente Header

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
      <body className="flex flex-col min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] antialiased">
        <Header />

        <main className="flex-grow p-4 md:p-8">
          <div className="max-w-4xl mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
