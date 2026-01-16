"use client"; // Necesario para usar usePathname

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiGrid, FiList, FiUser, FiLogOut } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // SI ESTAMOS EN LOGIN, NO RENDERIZAMOS NADA
  if (pathname === "/login") {
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  const navLinks = [
    { name: "Inicio", href: "/", icon: FiGrid },
    { name: "Transacciones", href: "/transacciones", icon: FiList },
  ];

  return (
    // MOVEMOS LOS ESTILOS DEL LAYOUT AQUÍ
    <header className="sticky top-0 z-50 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-white/5">
      <div className="w-full h-16 flex items-center justify-between  max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-tr from-[var(--color-primary)] to-orange-400 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-900/20 group-hover:scale-105 transition-transform">
            N
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Numo<span className="text-[var(--color-primary)]">.</span>
          </span>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[var(--color-primary)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Perfil y Logout */}
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className={`p-2 rounded-lg transition-colors ${
              pathname === "/profile"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            title="Mi Perfil"
          >
            <FiUser className="w-5 h-5" />
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Cerrar Sesión"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
