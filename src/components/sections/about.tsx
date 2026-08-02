import PaintedText from "@/components/ui/painted-text";
import { aboutLinks, aboutParagraphs } from "@/lib/content";

export default function About() {
  return (
    <section id="about" className="w-full">
      <PaintedText
        paragraphs={aboutParagraphs}
        links={aboutLinks}
        // The mobile size is load-bearing, not taste: PaintedText pins the copy
        // inside a centred h-screen box, so anything taller than the viewport
        // spills out of the top and paints over the bento deck. Height scales
        // with roughly the square of the font size (a smaller face both
        // shortens the lines and fits more per line), so 24px -> 16px is what
        // buys the headroom.
        className="text-base sm:text-2xl leading-normal sm:leading-relaxed [&:not(:first-child)]:mt-3 sm:[&:not(:first-child)]:mt-5"
        contentClassName="max-w-xl px-6"
      />
    </section>
  );
}
