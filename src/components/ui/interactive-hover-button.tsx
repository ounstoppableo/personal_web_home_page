import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  defaultBgColor?: string;
  defaultBorderColor?: string;
  defaultTextColor?: string;
  hoverBgColor?: string;
  hoverBorderColor?: string;
  hoverTextColor?: string;

  dotPosition?: string;
  border?: boolean;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(
  (
    {
      text = "Button",
      defaultBgColor = "transparent",
      defaultBorderColor = "white",
      defaultTextColor = "white",
      hoverBgColor = "white",
      hoverBorderColor = "white",
      hoverTextColor = "black",
      dotPosition = "40%",
      border = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        style={
          {
            "--defaultBgColor": defaultBgColor,
            "--defaultBorderColor": defaultBorderColor,
            "--defaultTextColor": defaultTextColor,
            "--hoverBgColor": hoverBgColor,
            "--hoverBorderColor": hoverBorderColor,
            "--hoverTextColor": hoverTextColor,
            transformOrigin: "left center",
          } as any
        }
        className={cn(
          `group relative w-[12vmin] h-[3vmin] cursor-pointer overflow-hidden rounded-full ${
            border ? "border-2" : ""
          }  p-2 text-center font-semibold`,
          className,
          "bg-[var(--defaultBgColor)]",
          "border-[var(--defaultBorderColor)]",
          "group-hover:border-[var(--hoverBorderColor)]"
        )}
        {...props}
      >
        <div className="absolute flex items-center justify-center gap-[8%] inset-0">
          <div
            style={{ "--top": `${dotPosition}` } as any}
            className={`absolute left-[20%] top-[50%] -translate-y-1/2 h-2 w-2 scale-[1] rounded-lg transition-all duration-300 group-hover:h-full group-hover:w-full group-hover:scale-[1.8] ${`group-hover:${"bg-[var(--hoverTextColor)]"} bg-[var(--hoverBgColor)]`} `}
          ></div>
          <div className="h-2 w-2"></div>
          <div
            className={`inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0 text-[var(--defaultTextColor)] text-[3vmin]`}
          >
            {text}
          </div>
        </div>
        <div
          className={cn(
            `absolute inset-0 z-10 flex h-full w-full translate-x-0 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100  text-[3vmin]`,
            "text-[var(--hoverTextColor)]"
          )}
        >
          <span>{text}</span>
          <ArrowRight className="h-[100%] w-[3vmin]" />
        </div>
      </button>
    );
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
