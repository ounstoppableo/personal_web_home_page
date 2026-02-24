import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import useMoveLogic from "./hooks/useMoveLogic";
import useResizeLogic from "./hooks/useResizeLogic";
import gsap from "gsap";
import useOperateLogic from "./hooks/useOperateLogic";

interface Safari_01Props {
  handleOpenChange?: (openStatus: boolean) => any;
  handleMinimizeChange?: (minimizeStatus: boolean) => any;
  handleFullscreenChange?: (fullscreenStatus: boolean) => any;
  className?: string;
  minimizeTarget?: any;
  onClose?: any;
  defaultOpen?: boolean;
  defaultMinimize?: boolean;
  defaultFullscreen?: boolean;
  children?: any;
  title?: string;
}

const SafariDialog: React.FC<Safari_01Props> = ({
  handleOpenChange,
  handleMinimizeChange,
  handleFullscreenChange,
  className,
  minimizeTarget,
  onClose,
  defaultOpen,
  defaultMinimize,
  defaultFullscreen,
  children,
  title,
}) => {
  const dialogRef = useRef(null);
  const dialogHeaderRef = useRef(null);
  const widthTo = useRef<any>(() => {});
  const heightTo = useRef<any>(() => {});
  const xTo = useRef<any>(() => {});
  const yTo = useRef<any>(() => {});
  const [movingOrResizing, setMovingOrResizing] = useState(false);
  const dialogContentContainerRef = useRef(null);
  const contentRef = useRef(null);
  const refreshContentSize = () => {
    const rect = dialogContentContainerRef.current.getBoundingClientRect();
    contentRef.current.style.transform = `scale(${rect.width / 1920},${
      rect.height / 1080
    })`;
  };
  useEffect(() => {
    gsap.set(dialogRef.current, {
      x: innerWidth / 4,
      y: innerHeight / 4,
    });
    widthTo.current = gsap.quickTo(dialogRef.current, "width", {
      duration: 0.1,
      onComplete: refreshContentSize,
    });
    heightTo.current = gsap.quickTo(dialogRef.current, "height", {
      duration: 0.1,
      onComplete: refreshContentSize,
    });
    xTo.current = gsap.quickTo(dialogRef.current, "x", { duration: 0.1 });
    yTo.current = gsap.quickTo(dialogRef.current, "y", { duration: 0.1 });
    refreshContentSize();
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

  const { open, fullscreen, handleClose, handleMinimize, handleFullscreen } =
    useOperateLogic({
      handleOpenChange,
      handleMinimizeChange,
      handleFullscreenChange,
      widthTo,
      heightTo,
      xTo,
      yTo,
      dialogRef,
      minimizeTarget,
      onClose,
      defaultOpen,
      defaultMinimize,
      defaultFullscreen,
    });
  useMoveLogic({
    dialogRef,
    dialogHeaderRef,
    widthTo,
    heightTo,
    xTo,
    yTo,
    fullscreen,
    setMovingOrResizing,
  });
  const {
    topResizeOperator,
    leftResizeOperator,
    rightResizeOperator,
    bottomResizeOperator,
    topLeftResizeOperator,
    bottomLeftResizeOperator,
    topRightResizeOperator,
    bottomRightResizeOperator,
  } = useResizeLogic({
    dialogRef,
    widthTo,
    heightTo,
    xTo,
    yTo,
    setMovingOrResizing,
    fullscreen,
  });
  return (
    <>
      <div
        style={{
          display: open ? "flex" : "none",
          zIndex: fullscreen ? "calc(var(--maxZIndex) + 1)" : "",
        }}
        className={cn(
          "pointer-events-auto min-w-[50dvw] min-h-[50dvh] flex flex-col absolute top-0 left-0 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-muted shadow-md",
          className,
          fullscreen ? "rounded-none" : ""
        )}
        ref={dialogRef}
      >
        {!fullscreen && (
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
        )}
        <div
          ref={dialogHeaderRef}
          className="rounded-[inherit] rounded-b-none overflow-hidden flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800"
        >
          <div className="flex items-center space-x-2">
            <span
              className="w-3 h-3 bg-red-400 rounded-full cursor-pointer"
              onClick={handleClose}
            />
            <span
              className="w-3 h-3 bg-yellow-400 rounded-full cursor-pointer"
              onClick={handleMinimize}
            />
            <span
              className="w-3 h-3 bg-green-500 rounded-full cursor-pointer"
              onClick={handleFullscreen}
            />
          </div>
          <div
            draggable="false"
            className="flex-1 mx-[10%] px-[8%] bg-gray-200 dark:bg-zinc-800 rounded-md h-5 flex justify-center items-center overflow-hidden"
          >
            <div
              className="max-w-full text-foreground text-xs truncate select-none drag-none"
              title=""
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
            >
              {title}
            </div>
          </div>
          <div className="w-4 h-4" /> {/* Placeholder for right side icons */}
        </div>
        <div
          ref={dialogContentContainerRef}
          className="relative w-full flex-1 rounded-[inherit] rounded-t-none bg-gray-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden"
        >
          <div
            className="absolute inset-0 overflow-hidden z-0 w-480 h-270 origin-top-left"
            ref={contentRef}
          >
            {children}
          </div>
          <div
            className="absolute inset-0"
            style={{ zIndex: movingOrResizing ? 1 : -1 }}
          ></div>
        </div>
      </div>
    </>
  );
};

export default SafariDialog;
