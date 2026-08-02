import Cursor from "@/components/icons/cursor";
import BentoCard from "../bento-card";
import BentoCardHeader from "../bento-card-header";

export default function EkkelesiaCard({ reduced }: { reduced: boolean }) {
  return (
    <BentoCard
      card="ekkelesia"
      href="/projects?open=ekklesia"
      reduced={reduced}
      className="rotate-[-1.25deg] sm:rotate-0 aspect-square sm:row-span-3 sm:aspect-2/5 lg:col-span-2"
    >
      <BentoCardHeader
        kicker="Web App"
        title="Ekkelesia"
        description="Church operating system"
        width="50%"
      />
      <Cursor className="absolute top-5 right-4 w-6 h-6 text-primary transition-transform duration-300 group-hover:translate-x-px group-hover:translate-y-0.5" />
      <div className="absolute inset-y-0 left-10 w-[90%] sm:w-[180%] overflow-hidden rounded-t-lg group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300">
        <div className="relative flex items-end h-full w-full">
          <img
            loading="eager"
            width={100}
            height={100}
            alt="Ekkelesia App"
            src="/images/ekklesia.png"
            className="pointer-events-none rounded-t-lg aspect-video w-full border border-neutral-50"
          />
        </div>
      </div>
    </BentoCard>
  );
}
