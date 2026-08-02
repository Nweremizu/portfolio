import BentoCard from "../bento-card";
import BentoCardHeader from "../bento-card-header";

export default function KeipyCard({ reduced }: { reduced: boolean }) {
  return (
    <BentoCard
      card="keipy"
      href="/projects?open=keipy"
      reduced={reduced}
      className="rotate-[1.5deg] sm:rotate-0 aspect-square lg:col-span-2"
    >
      <BentoCardHeader
        kicker="Mobile App"
        title="Keipy"
        description="Invoicing Redefined"
        width="50%"
      />
      {/* right-0 rather than w-full: combined with left-[45%] a full-width box
          would hang ~180px past the card's right edge, and anchoring the art to
          that edge puts it entirely outside the visible card. */}
      <div className="absolute left-[45%] right-0 -bottom-20 h-[78%]">
        {/* h-full/w-full are load-bearing. `inset-0` alone does not stretch a
            replaced element: CSS resolves an <img> with `width:auto` to its
            intrinsic size and drops one offset, so without these the artwork
            sits frozen at its natural 72x147 at every breakpoint while the card
            grows around it — and `object-cover` never engages, because the box
            already is the image. `contain` keeps the whole mockup visible; the
            card's own overflow-hidden does the cropping. */}
        <img
          loading="eager"
          alt="Keipy App"
          src="/images/keipy.png"
          className="absolute inset-0 h-full w-full object-contain object-bottom rounded drop-shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pointer-events-none group-hover:scale-[105%] transition-transform duration-300"
        />
      </div>
    </BentoCard>
  );
}
