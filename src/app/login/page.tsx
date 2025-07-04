// En src/app/login/page.tsx (versión corregida y completa)

"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  // Este "efecto" escucha los cambios en la autenticación (login/logout)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // Si el evento es un inicio de sesión exitoso...
      if (event === "SIGNED_IN") {
        // Refrescamos la página. El middleware se encargará de mantener al usuario
        // en la página de login si la sesión aún no es válida, o la página principal
        // lo recibirá si la sesión es correcta. Para una redirección más directa:
        router.push("/");
        router.refresh(); // Asegura que el estado del servidor se actualice
      }
    });

    // Limpiamos el "escucha" cuando el componente se desmonta
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <main className="p-4 bg-slate-50 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Iniciar Sesión en Numo
        </h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]} // Asegura que solo se muestre el formulario de email
        />
      </div>
    </main>
  );
}
