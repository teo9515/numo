import Link from "next/link";

type NavCardProps = {
  href: string;
  title: string;
};

export default function NavCard({ href, title }: NavCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="w-[180px] h-16 flex justify-center items-center bg-[var(--color-primary)] border border-[var(--color-text-secondary)]/20 rounded-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-lg">
        <h3 className="text-sm font-normal text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors tracking-[2px]">
          {title}
        </h3>
      </div>
    </Link>
  );
}
