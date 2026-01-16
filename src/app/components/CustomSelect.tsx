"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown, FiCheck } from "react-icons/fi";

interface Option {
  id: number | string;
  label: string;
  subLabel?: string;
}

interface CustomSelectProps {
  label: string;
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
}

export default function CustomSelect({
  label,
  options,
  value,
  onChange,
  disabled = false,
  placeholder = "Seleccionar...",
  icon,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Agregamos 'placement' para saber hacia dónde abrir
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    placement: "bottom",
  });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;

      // Estimamos la altura máxima del menú (max-h-60 es aprox 240px)
      const MENU_HEIGHT = 250;

      // LÓGICA INTELIGENTE:
      // Si hay menos de 250px abajo, lo mandamos para arriba.
      // Si hay espacio, se queda abajo (default).
      let placement = "bottom";
      let top = rect.bottom + window.scrollY + 8; // Default: Abajo (+ margen)

      if (spaceBelow < MENU_HEIGHT) {
        placement = "top";
        top = rect.top + window.scrollY - 8; // Arriba (- margen)
      }

      setCoords({
        top,
        left: rect.left + window.scrollX,
        width: rect.width,
        placement,
      });
    }
  };

  const toggleOpen = () => {
    if (!disabled) {
      if (!isOpen) {
        updateCoords();
      }
      setIsOpen(!isOpen);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    function handleGlobalClick(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    const handleScrollOrResize = () => {
      if (isOpen) setIsOpen(false);
    };

    window.addEventListener("mousedown", handleGlobalClick);
    window.addEventListener("scroll", handleScrollOrResize, { capture: true });
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("mousedown", handleGlobalClick);
      window.removeEventListener("scroll", handleScrollOrResize, {
        capture: true,
      });
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.id === value);

  // Renderizado del Menú
  const DropdownMenu = mounted ? (
    <div
      // CLASE DINÁMICA: Si placement es 'top', agregamos '-translate-y-full' y 'origin-bottom'
      className={`absolute z-[9999] bg-[#1A1A1A] border border-white/10 rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto scrollbar-sutil transition-all ${
        coords.placement === "top"
          ? "-translate-y-full origin-bottom"
          : "origin-top"
      }`}
      style={{
        top: coords.top,
        left: coords.left,
        width: coords.width,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {options.length > 0 ? (
        <div className="p-1">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between group transition-colors ${
                value === option.id
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                {option.subLabel && (
                  <span
                    className={`text-[10px] ${
                      value === option.id
                        ? "text-[var(--color-primary)]/70"
                        : "text-gray-500 group-hover:text-gray-400"
                    }`}
                  >
                    {option.subLabel}
                  </span>
                )}
              </div>
              {value === option.id && <FiCheck size={16} />}
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-xs text-gray-500">
          No hay opciones disponibles
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className="space-y-1.5 relative">
      <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1">
        {icon} {label}
      </label>

      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-black/40 border rounded-lg text-left flex items-center justify-between transition-all ${
          isOpen
            ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]"
            : "border-white/10 hover:border-white/20"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`text-sm truncate ${
            !selectedOption ? "text-gray-500" : "text-white"
          }`}
        >
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.label}
              {selectedOption.subLabel && (
                <span className="text-xs text-gray-500">
                  ({selectedOption.subLabel})
                </span>
              )}
            </span>
          ) : (
            placeholder
          )}
        </span>

        {/* Rotamos la flecha según si está abierto */}
        <FiChevronDown
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && mounted && DropdownMenu
        ? createPortal(DropdownMenu, document.body)
        : null}
    </div>
  );
}
