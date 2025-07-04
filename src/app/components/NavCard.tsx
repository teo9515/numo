import Link from "next/link";

type NavCardProps = {
  href: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
};

export default function NavCard({
  href,
  title,
  description,
  icon,
}: NavCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="p-5 bg-[var(--color-primary)] border border-[var(--color-text-secondary)]/20 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
            {title}
          </h3>
          {icon && (
            <div className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors">
              {icon}
            </div>
          )}
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed group-hover:text-[var(--color-primary)] transition-colors">
          {description}
        </p>
      </div>
    </Link>
  );
}
