import { CrownIcon, SunshineIcon } from "@/components/icons/book";
import Logo from "@/components/ui/logo";
import BentoCard from "../bento-card";

/** The hub at the centre of the ring — it fades in, it never travels. */
export default function AboutMeCard({ reduced }: { reduced: boolean }) {
  return (
    <BentoCard
      card="me"
      href="#about"
      reduced={reduced}
      className="rotate-[-1.75deg] sm:rotate-0 aspect-square sm:col-span-2 sm:aspect-5/3 lg:col-span-3"
    >
      <Logo className="absolute left-[26%] top-12 size-full" />
      <div className="absolute top-4 right-8">
        <CrownIcon />
      </div>
      <div className="absolute bottom-4 left-4">
        <p className="text-sm text-secondary">About Me</p>
      </div>
      <div className="absolute top-8 left-6">
        <SunshineIcon className="md:scale-105" />
      </div>
    </BentoCard>
  );
}
