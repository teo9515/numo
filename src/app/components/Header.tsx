import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import LogoutButton from "../components/LogOutButton";

export default async function Header() {
  // Crear cliente de Supabase para el servidor (nueva API)
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // En componentes de solo lectura, típicamente no necesitas setAll
          // pero se requiere para la interfaz
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Ignore errors en componentes de solo lectura
            }
          });
        },
      },
    }
  );

  // Obtener el usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex w-full justify-between ">
      <div className="space-y-5 w-full">
        <div className="flex justify-between w-full">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Numo
          </h1>
          <div className="pt-2">{user && <LogoutButton />}</div>
        </div>
        {user && (
          <div>
            <p className="text-md text-slate-400 ">Bienvenido de nuevo, </p>
            <h4 className="font-medium text-white">{user.email}</h4>
          </div>
        )}
      </div>
    </header>
  );
}
