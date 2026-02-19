import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import useMoveLogic from "./hooks/useMoveLogic";
import useResizeLogic from "./hooks/useResizeLogic";
import gsap from "gsap";

interface Safari_01Props {
  className?: string;
}

const SafariDialog: React.FC<Safari_01Props> = ({ className }) => {
  const dialogRef = useRef(null);
  const dialogHeaderRef = useRef(null);
  const widthTo = useRef<any>(() => {});
  const heightTo = useRef<any>(() => {});
  const xTo = useRef<any>(() => {});
  const yTo = useRef<any>(() => {});
  useEffect(() => {
    widthTo.current = gsap.quickTo(dialogRef.current, "width", {
      duration: 0.1,
    });
    heightTo.current = gsap.quickTo(dialogRef.current, "height", {
      duration: 0.1,
    });
    xTo.current = gsap.quickTo(dialogRef.current, "x", { duration: 0.1 });
    yTo.current = gsap.quickTo(dialogRef.current, "y", { duration: 0.1 });
    const cb = () => {
      requestAnimationFrame(() => {
        const dialogRect = dialogRef.current.getBoundingClientRect();
        widthTo.current(dialogRect.width);
        heightTo.current(dialogRect.height);
      });
    };

    window.addEventListener("resize", cb);
    return () => {
      window.removeEventListener("resize", cb);
      gsap.killTweensOf(dialogRef.current);
    };
  }, []);
  useMoveLogic({ dialogRef, dialogHeaderRef, widthTo, heightTo, xTo, yTo });
  const {
    topResizeOperator,
    leftResizeOperator,
    rightResizeOperator,
    bottomResizeOperator,
    topLeftResizeOperator,
    bottomLeftResizeOperator,
    topRightResizeOperator,
    bottomRightResizeOperator,
  } = useResizeLogic({ dialogRef, widthTo, heightTo, xTo, yTo });
  return (
    <>
      <div
        className={cn(
          "min-w-[50dvw] min-h-[50dvh] flex flex-col absolute top-0 left-0 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-muted shadow-md",
          className,
        )}
        ref={dialogRef}
      >
        <>
          <div
            ref={topResizeOperator}
            className="absolute top-0 -translate-y-1/2 h-2 w-full bg-transparent cursor-n-resize"
          ></div>
          <div
            ref={bottomResizeOperator}
            className="absolute bottom-0 translate-y-1/2 h-2 w-full bg-transparent cursor-s-resize"
          ></div>
          <div
            ref={leftResizeOperator}
            className="absolute left-0 -translate-x-1/2 w-2 h-full bg-transparent cursor-w-resize"
          ></div>
          <div
            ref={rightResizeOperator}
            className="absolute right-0 translate-x-1/2 w-2 h-full bg-transparent cursor-e-resize"
          ></div>

          <div
            ref={topLeftResizeOperator}
            className="absolute top-0 left-0 -translate-1/2 h-2 w-2 bg-transparent cursor-nw-resize"
          ></div>
          <div
            ref={topRightResizeOperator}
            className="absolute top-0 right-0  translate-x-1/2 -translate-y-1/2 h-2 w-2 bg-transparent cursor-ne-resize"
          ></div>
          <div
            ref={bottomLeftResizeOperator}
            className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 h-2 w-2 bg-transparent cursor-sw-resize"
          ></div>
          <div
            ref={bottomRightResizeOperator}
            className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 h-2 w-2 bg-transparent cursor-se-resize"
          ></div>
        </>
        <div
          ref={dialogHeaderRef}
          className="rounded-[inherit] rounded-b-none overflow-hidden flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800"
        >
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-red-400 rounded-full" />
            <span className="w-3 h-3 bg-yellow-400 rounded-full" />
            <span className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          <div className="flex-1 mx-4 bg-gray-200 dark:bg-zinc-800 rounded-md h-5" />
          <div className="w-4 h-4" /> {/* Placeholder for right side icons */}
        </div>
        <div className="w-full flex-1 rounded-[inherit] rounded-t-none bg-gray-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden"></div>
      </div>
    </>
  );
};

export default SafariDialog;
