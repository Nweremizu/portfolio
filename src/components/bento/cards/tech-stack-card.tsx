"use client";

import { Button } from "react-aria-components";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { techStack } from "@/lib/tech-stack";
import BentoCard from "../bento-card";
import BentoCardHeader from "../bento-card-header";

export default function TechStackCard({ reduced }: { reduced: boolean }) {
  return (
    <BentoCard
      card="techStack"
      reduced={reduced}
      className="rotate-[1deg] sm:rotate-0 aspect-square sm:col-span-2 sm:aspect-5/1 lg:col-span-6"
    >
      <BentoCardHeader
        kicker="Tech Stack"
        title="Technologies I use"
        width="70%"
        className="sm:pr-[70%]"
      />
      <div className="absolute inset-y-0 right-0 w-full sm:w-[50%] gap-y-4.5 flex flex-wrap items-center justify-center sm:justify-start content-center gap-4 px-4 sm:pl-2 sm:pr-6">
        {techStack.map(({ name, Icon }) => (
          <TooltipTrigger key={name}>
            <Button className="shrink-0 cursor-default border-none bg-transparent p-0 outline-none">
              <Icon className="h-7 w-auto" />
            </Button>
            <Tooltip>{name}</Tooltip>
          </TooltipTrigger>
        ))}
      </div>
    </BentoCard>
  );
}
