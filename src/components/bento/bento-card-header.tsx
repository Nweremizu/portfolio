import { cn } from "@/lib/cn";

interface BentoCardHeaderProps {
  kicker: string;
  title: string;
  description?: string;
  width?: string;
  className?: string;
}

export default function BentoCardHeader({
  kicker,
  title,
  description,
  width = "62%",
  className,
}: BentoCardHeaderProps) {
  const classs = `sm:pr-[${width}]!`;

  return (
    <div
      className={cn(`relative p-6 flex flex-col gap-y-px`, classs, className)}
    >
      <p className="text-sm text-secondary">{kicker}</p>
      <h4 className="text-2xl leading-tight font-semibold text-balance pt-0.5">
        {title}
      </h4>
      {description && (
        <p className="text-sm text-secondary pt-0.5">{description}</p>
      )}
    </div>
  );
}
