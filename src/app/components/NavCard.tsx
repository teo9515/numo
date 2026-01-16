"use client";

import Link from "next/link";
import { MouseEvent } from "react";

type NavCardProps = {
  href: string;
  title: string;
  isDemo?: boolean; // Recibimos el estado del demo
};

export default function NavCard({ href, title, isDemo = false }: NavCardProps) {
  const handleClick = (e: MouseEvent) => {
    if (isDemo) {
      e.preventDefault(); // Detenemos la navegación real
      alert(
        `🚧 Vista Previa: La sección "${title}" requiere inicio de sesión. En el portfolio solo el Dashboard es interactivo.`
      );
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="group  w-full flex justify-around"
    >
      <div
        className="
            w-5/6 h-10 
            flex justify-center items-center 
            /* DISEÑO SUTIL: Fondo oscuro con borde suave, en vez de bloque sólido */
            bg-black/40 backdrop-blur-sm
            border border-[var(--color-text-secondary)]/20 
            rounded-lg 
            transition-all duration-300 
            
            /* HOVER: El borde se pone naranja y brilla un poco */
            hover:scale-[1.02] 
            hover:shadow-lg hover:shadow-[var(--color-primary)]/10
            hover:border-[var(--color-primary)]
            group-hover:bg-black/60
        "
      >
        <h3
          className="
                text-xs font-medium tracking-[2px] uppercase
                text-[var(--color-text-primary)] 
                /* HOVER TEXT: Ahora sí, el texto se pone naranja sobre fondo negro */
                group-hover:text-[var(--color-primary)] 
                transition-colors
            "
        >
          {title}
        </h3>
      </div>
    </Link>
  );
}
