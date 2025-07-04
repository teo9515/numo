// En src/components/LogoutButton.tsx

"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";

export default function LogOutButton() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Esto le dice a Next.js que refresque la página del servidor
  };

  return (
    <button onClick={handleLogout}>
      <FiLogOut className="w-8 h-8 text-[var(--brand-orange)] hover:text-[var(--brand-orange-hover)] transition-colors" />
    </button>
  );
}
