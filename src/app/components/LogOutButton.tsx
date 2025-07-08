// En src/components/LogoutButton.tsx

"use client";

import { createClient } from "@/lib/supabase/client"; // Cambio aquí
import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";

export default function LogOutButton() {
  const router = useRouter();
  const supabase = createClient(); // Cambio aquí - ya no necesitas las variables de entorno

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Esto le dice a Next.js que refresque la página del servidor
  };

  return (
    <button onClick={handleLogout}>
      <FiLogOut className="w-6 h-6 text-[var(--brand-orange)] hover:text-[var(--brand-orange-hover)] transition-colors" />
    </button>
  );
}
