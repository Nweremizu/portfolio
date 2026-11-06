/** Styling for parsed markdown post bodies — shared by the live post page and the admin preview, so a draft looks exactly like what publishing will produce. */
export const PROSE_CLASS =
  "text-foreground/85 leading-relaxed " +
  "[&_p]:pt-4 [&_p]:text-pretty [&_h2]:text-lg [&_h2]:text-foreground [&_h2]:font-medium [&_h2]:pt-10 " +
  "[&_h3]:font-medium [&_h3]:text-foreground [&_h3]:pt-6 " +
  "[&_strong]:font-medium [&_strong]:text-foreground [&_em]:font-serif [&_em]:italic [&_em]:text-[1.1em] " +
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:pt-4 " +
  "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:pt-4 " +
  "[&_li]:pt-1 [&_li]:marker:text-secondary " +
  "[&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-3 [&_a]:decoration-secondary/40 " +
  "[&_code]:font-mono [&_code]:text-[0.85em] [&_code]:bg-card [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 " +
  "[&_pre]:bg-card [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:mt-4 [&_pre]:overflow-x-auto [&_pre]:text-sm " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-secondary [&_blockquote]:mt-4";
