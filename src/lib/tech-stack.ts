import type { ComponentType, SVGProps } from "react";
import ClaudeIcon from "@/components/icons/claude";
import CodexIcon from "@/components/icons/codex";
import DenoIcon from "@/components/icons/deno";
import DockerIcon from "@/components/icons/docker";
import FigmaIcon from "@/components/icons/figma";
import JavascriptIcon from "@/components/icons/javascript";
import LaravelIcon from "@/components/icons/laravel";
import NodejsIcon from "@/components/icons/nodejs";
import PythonIcon from "@/components/icons/python";
import ReactIcon from "@/components/icons/react";
import ReactNativeIcon from "@/components/icons/react-native";
import TypescriptIcon from "@/components/icons/typescript";
import VercelIcon from "@/components/icons/vercel";
import VscodeIcon from "@/components/icons/vscode";

export interface Tech {
  name: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const techStack: Tech[] = [
  { name: "Python", Icon: PythonIcon },
  { name: "Figma", Icon: FigmaIcon },
  { name: "Node.js", Icon: NodejsIcon },
  { name: "JavaScript", Icon: JavascriptIcon },
  { name: "TypeScript", Icon: TypescriptIcon },
  { name: "React", Icon: ReactIcon },
  { name: "React Native", Icon: ReactNativeIcon },
  { name: "Expo", Icon: VercelIcon },
  { name: "Laravel", Icon: LaravelIcon },
  { name: "VS Code", Icon: VscodeIcon },
  { name: "Claude", Icon: ClaudeIcon },
  { name: "Codex", Icon: CodexIcon },
  { name: "Copilot", Icon: DenoIcon },
  { name: "Docker", Icon: DockerIcon },
];
