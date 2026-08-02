import BookIcon, { Bulb } from "@/components/icons/book";
import BentoCard from "../bento-card";
import BentoCardHeader from "../bento-card-header";

export default function ThoughtsCard({ reduced }: { reduced: boolean }) {
  return (
    <BentoCard
      card="thoughts"
      href="/writing"
      reduced={reduced}
      // Single column at sm/md so dense packing drops this into the free slot
      // under Keipy. Spanning both columns forced it to wait for a fully empty
      // row — which never comes while Ekkelesia holds column two for three
      // rows — so it landed far below, leaving a hole.
      className="rotate-[2deg] sm:rotate-0 aspect-square sm:aspect-5/3 lg:col-span-3"
    >
      <BentoCardHeader
        kicker="Writing"
        title="Engineering Thoughts"
        width="70%"
        className="sm:pr-[70%]"
      />
      <div className="absolute bottom-3 left-2">
        <Bulb className="absolute bottom-0" />
      </div>
      <div className="absolute bottom-8 right-4">
        <BookIcon className="md:scale-105" />
      </div>
    </BentoCard>
  );
}
