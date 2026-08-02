import { socials } from "./socials";

/** Editable site copy, kept out of the components that lay it out. */

export const hero = {
  greeting: "Hi there, I'm",
  name: "Nweremizu Bruno.",
  headline: ["Engineering practical products", "for real businesses."],
  role: "FullStack Developer",
};

export const aboutParagraphs = [
  "I like building software that people genuinely enjoy using.",
  "I'm a full-stack software engineer who enjoys turning ideas into practical products, from AI-powered tools to desktop and web applications. I'm most at home thinking about product design, architecture, and the small details that make software feel intuitive.",
  "Outside of coding, you'll usually find me exploring new ideas, editing videos, watching football, or experimenting with AI workflows. This site is where I share the products I'm building, the lessons I'm learning, and the occasional idea that grows into something bigger.",
  "This site is where I document all of that – some polished, alot still in progess.",
  "if you wanna say hi, you can find me on LinkedIn or Gmail.",
];

/** Words in `aboutParagraphs` that should render as links. */
export const aboutLinks = {
  LinkedIn: socials.LinkedIn,
  Gmail: socials.Gmail,
};

/** The footer's closing statement; the second half is emphasised. */
export const footerStatement = ["Let's build something", "practical."];
