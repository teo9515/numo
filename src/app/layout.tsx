import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import { Toaster } from "sonner";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Numo",
  description: "App de finanzas",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="es">
      {/* AGREGADO: 'mx-auto' para centrar el contenedor de w-5/6 */}
      <body className="flex flex-col min-h-screen w-5/6 mx-auto bg-[var(--color-background)] text-[var(--color-text-primary)] antialiased font-sans ">
        <Suspense fallback={null}>
          <Header user={user} />
        </Suspense>

        <main className="flex-grow">
          <div className="w-full h-full p-5">{children}</div>
        </main>

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1A1A1A",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
            },
          }}
        />
      </body>
    </html>
  );
}
