"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  FiZap,
  FiMail,
  FiLock,
  FiAlertCircle,
  FiArrowRight,
  FiUserPlus,
} from "react-icons/fi";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) {
        if (supabaseError.message.includes("Invalid login credentials")) {
          throw new Error("Usuario o contraseña incorrectos.");
        }
        if (supabaseError.message.includes("Email not confirmed")) {
          throw new Error("Por favor confirma tu correo electrónico.");
        }
        throw supabaseError;
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      let errorMessage = "Ocurrió un error inesperado";
      if (err instanceof Error) errorMessage = err.message;
      else if (typeof err === "string") errorMessage = err;

      setError(errorMessage);
      setIsLoading(false);
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center py-2 bg-[var(--color-background)] relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-primary)]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Tarjeta de Login */}
      <div className="w-full max-w-md p-8 rounded-lg shadow-2xl bg-[var(--color-surface)] border border-white/10 relative z-10 flex flex-col">
        {/* ALERTA DE ERROR (Integrada en la tarjeta) */}
        {/* Cambiamos 'absolute' por un diseño estático que empuja el contenido */}
        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="shrink-0 bg-red-500 rounded-full p-1 text-white">
              <FiAlertCircle size={14} />
            </div>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block group cursor-pointer">
            <h1 className="text-4xl font-extrabold text-white mb-2 transition-transform group-hover:scale-105 tracking-tight">
              Numo<span className="text-[var(--color-primary)]">.</span>
            </h1>
          </Link>
          <p className="text-[var(--color-text-secondary)] text-sm font-medium">
            Tus finanzas, simplificadas.
          </p>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Input Email */}
          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium text-xs uppercase tracking-wider ml-1">
              Correo Electrónico
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--color-primary)] transition-colors">
                <FiMail />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-1.5">
            <label className="text-gray-400 font-medium text-xs uppercase tracking-wider ml-1">
              Contraseña
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--color-primary)] transition-colors">
                <FiLock />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all text-sm"
                required
              />
            </div>

            <div className="flex justify-between items-center pt-1">
              <Link
                href="/register"
                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <FiUserPlus size={12} /> Crear cuenta
              </Link>
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--color-primary)] hover:text-white transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4 !border-0"
          >
            {isLoading ? (
              "Iniciando..."
            ) : (
              <>
                Iniciar Sesión <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Sección Modo Demo */}
        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <p className="text-[var(--color-text-secondary)] text-xs mb-4">
            ¿Solo estás visitando el portfolio?
          </p>
          <Link href="/?demo=true" className="block">
            <button
              type="button"
              className="w-full py-3 px-4 rounded-xl border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all font-semibold text-sm shadow-lg shadow-orange-900/10 hover:shadow-orange-600/20 cursor-pointer flex items-center justify-center gap-2 group"
            >
              <FiZap className="group-hover:animate-pulse" />
              Probar Modo Demo (Sin registro)
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
