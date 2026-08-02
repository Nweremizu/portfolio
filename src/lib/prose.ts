/** Styling for parsed markdown post bodies — shared by the live post page and the admin preview, so a draft looks exactly like what publishing will produce. */
export const PROSE_CLASS =
  "text-foreground leading-relaxed " +
  "[&_p]:pt-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:pt-8 " +
  "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:pt-6 " +
  "[&_strong]:font-semibold [&_em]:italic " +
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:pt-4 " +
  "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:pt-4 " +
  "[&_li]:pt-1 " +
  "[&_a]:text-primary [&_a]:underline [&_a]:decoration-dotted " +
  "[&_code]:font-mono [&_code]:text-sm [&_code]:bg-card [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 " +
  "[&_pre]:bg-card [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:mt-4 [&_pre]:overflow-x-auto " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-secondary [&_blockquote]:pl-4 [&_blockquote]:text-secondary [&_blockquote]:mt-4";
