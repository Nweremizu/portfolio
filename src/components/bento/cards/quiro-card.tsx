import BentoCard from "../bento-card";
import BentoCardHeader from "../bento-card-header";

export default function QuiroCard({ reduced }: { reduced: boolean }) {
  return (
    <BentoCard
      card="quiro"
      href="/projects?open=quiro"
      reduced={reduced}
      className="rotate-[-2deg] sm:rotate-0 aspect-square sm:col-span-2 sm:aspect-2/1 lg:col-span-4"
    >
      <BentoCardHeader
        kicker="Desktop App"
        title="Quiro"
        description="Cinematic screen recorder"
      />
      <div className="absolute inset-y-0 -right-10 -bottom-10 w-[80%] sm:w-[64%] overflow-hidden rounded-t-lg">
        <div className="relative flex items-end h-full w-full">
          <img
            loading="eager"
            width={100}
            height={100}
            alt="Quiro App"
            src="/images/quiro.png"
            className="pointer-events-none rounded-t-lg aspect-video w-full"
          />
        </div>
      </div>
    </BentoCard>
  );
}
