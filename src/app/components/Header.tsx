import { createClient } from "@/lib/supabase/server";
import LogoutButton from "../components/LogOutButton";

export default async function Header() {
  // Usar el cliente de servidor centralizado
  const supabase = await createClient();

  // Obtener el usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex w-full justify-between p-4">
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
