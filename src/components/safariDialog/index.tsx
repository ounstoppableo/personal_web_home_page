import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import useMoveLogic from "./hooks/useMoveLogic";
import useResizeLogic from "./hooks/useResizeLogic";
import gsap from "gsap";
import useOperateLogic from "./hooks/useOperateLogic";
import { useDispatch, useSelector } from "react-redux";

interface Safari_01Props {
  handleOpenChange?: (openStatus: boolean) => any;
  handleMinimizeChange?: (minimizeStatus: boolean) => any;
  handleFullscreenChange?: (fullscreenStatus: boolean) => any;
  handleHeaderMouseDownCb?: () => any;
  className?: string;
  minimizeTargetSelector?: string;
  onClose?: any;
  defaultOpen?: boolean;
  defaultMinimize?: boolean;
  defaultFullscreen?: boolean;
  children?: any;
  title?: string;
  zIndex?: number;
}

const SafariDialog: React.FC<Safari_01Props> = ({
  handleOpenChange,
  handleMinimizeChange,
  handleFullscreenChange,
  handleHeaderMouseDownCb,
  className,
  minimizeTargetSelector,
  onClose,
  defaultOpen,
  defaultMinimize,
  defaultFullscreen,
  children,
  title,
  zIndex,
}) => {
  const dialogRef = useRef(null);
  const dialogHeaderRef = useRef(null);
  const widthTo = useRef<any>(() => {});
  const heightTo = useRef<any>(() => {});
  const xTo = useRef<any>(() => {});
  const yTo = useRef<any>(() => {});
  const originalInfo = useRef({
    width: undefined,
    height: undefined,
    x: undefined,
    y: undefined,
  });
  const movingOrResizing = useSelector(
    (state: any) => state.dialog.movingOrResizing
  );
  const dialogContentContainerRef = useRef(null);
  const contentRef = useRef(null);
  const refreshContentSize = () => {
    const rect = dialogContentContainerRef.current.getBoundingClientRect();
    contentRef.current.style.transform = `scale(${rect.width / innerWidth},${
      rect.height / innerHeight
    })`;
  };
  const refreshOriginalInfo = () => {
    originalInfo.current = {
      width: +gsap.getProperty(dialogRef.current, "width"),
      height: +gsap.getProperty(dialogRef.current, "height"),
      x: +gsap.getProperty(dialogRef.current, "x"),
      y: +gsap.getProperty(dialogRef.current, "y"),
    };
  };

  const {
    open,
    fullscreen,
    handleClose,
    handleMinimize,
    handleFullscreen,
    minimizeSync,
  } = useOperateLogic({
    handleOpenChange,
    handleMinimizeChange,
    handleFullscreenChange,
    widthTo,
    heightTo,
    xTo,
    yTo,
    dialogRef,
    minimizeTargetSelector,
    onClose,
    defaultOpen,
    defaultMinimize,
    defaultFullscreen,
    originalInfo,
    refreshContentSize,
    refreshOriginalInfo,
  });
  const {
    mousedownCb: moveMousedownCb,
    mousemoveCb: moveMousemoveCb,
    mouseupCb: moveMouseupCb,
  } = useMoveLogic({
    dialogRef,
    dialogHeaderRef,
    widthTo,
    heightTo,
    xTo,
    yTo,
    fullscreen,
    originalInfo,
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
    topMouseDown,
    bottomMouseDown,
    leftMouseDown,
    rightMouseDown,
    topLeftMouseDown,
    topRightMouseDown,
    bottomLeftMouseDown,
    bottomRightMouseDown,
    mousemoveCb: resizeMousemoveCb,
    mouseupCb: resizeMouseupCb,
  } = useResizeLogic({
    dialogRef,
    widthTo,
    heightTo,
    xTo,
    yTo,
    fullscreen,
    originalInfo,
  });

  useEffect(() => {
    gsap.set(dialogRef.current, {
      x: innerWidth / 4,
      y: innerHeight / 4,
    });
    refreshOriginalInfo();
    widthTo.current = gsap.quickTo(dialogRef.current, "width", {
      duration: 0.1,
      onComplete: () => {
        refreshContentSize();
        refreshOriginalInfo();
      },
    });
    heightTo.current = gsap.quickTo(dialogRef.current, "height", {
      duration: 0.1,
      onComplete: () => {
        refreshContentSize();
        refreshOriginalInfo();
      },
    });
    xTo.current = gsap.quickTo(dialogRef.current, "x", {
      duration: 0.1,
      onComplete: refreshOriginalInfo,
    });
    yTo.current = gsap.quickTo(dialogRef.current, "y", {
      duration: 0.1,
      onComplete: refreshOriginalInfo,
    });
    refreshContentSize();
    const cb = () => {
      requestAnimationFrame(() => {
        if (minimizeSync.current) return;
        const dialogRect = dialogRef.current.getBoundingClientRect();
        widthTo.current(dialogRect.width);
        heightTo.current(dialogRect.height);
        refreshOriginalInfo();
      });
    };

    window.addEventListener("resize", cb);
    return () => {
      window.removeEventListener("resize", cb);
      gsap.killTweensOf(dialogRef.current);
    };
  }, []);
  return (
    <>
      <div
        style={{
          display: open ? "flex" : "none",
          zIndex: fullscreen ? "calc(var(--maxZIndex) + 1)" : zIndex,
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
              onPointerDown={(e) => {
                topMouseDown(e);
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={resizeMousemoveCb}
              onPointerUp={resizeMouseupCb}
              style={{ touchAction: "none" }}
              className="absolute top-0 -translate-y-1/2 h-2 w-full bg-transparent cursor-n-resize"
            ></div>
            <div
              ref={bottomResizeOperator}
              onPointerDown={(e) => {
                bottomMouseDown(e);
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={resizeMousemoveCb}
              onPointerUp={resizeMouseupCb}
              style={{ touchAction: "none" }}
              className="absolute bottom-0 translate-y-1/2 h-2 w-full bg-transparent cursor-s-resize"
            ></div>
            <div
              ref={leftResizeOperator}
              onPointerDown={(e) => {
                leftMouseDown(e);
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={resizeMousemoveCb}
              onPointerUp={resizeMouseupCb}
              style={{ touchAction: "none" }}
              className="absolute left-0 -translate-x-1/2 w-2 h-full bg-transparent cursor-w-resize"
            ></div>
            <div
              ref={rightResizeOperator}
              onPointerDown={(e) => {
                rightMouseDown(e);
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={resizeMousemoveCb}
              onPointerUp={resizeMouseupCb}
              style={{ touchAction: "none" }}
              className="absolute right-0 translate-x-1/2 w-2 h-full bg-transparent cursor-e-resize"
            ></div>

            <div
              ref={topLeftResizeOperator}
              onPointerDown={(e) => {
                topLeftMouseDown(e);
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={resizeMousemoveCb}
              onPointerUp={resizeMouseupCb}
              style={{ touchAction: "none" }}
              className="absolute top-0 left-0 -translate-1/2 h-2 w-2 bg-transparent cursor-nw-resize"
            ></div>
            <div
              ref={topRightResizeOperator}
              onPointerDown={(e) => {
                topRightMouseDown(e);
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={resizeMousemoveCb}
              onPointerUp={resizeMouseupCb}
              style={{ touchAction: "none" }}
              className="absolute top-0 right-0  translate-x-1/2 -translate-y-1/2 h-2 w-2 bg-transparent cursor-ne-resize"
            ></div>
            <div
              ref={bottomLeftResizeOperator}
              onPointerDown={(e) => {
                bottomLeftMouseDown(e);
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={resizeMousemoveCb}
              onPointerUp={resizeMouseupCb}
              style={{ touchAction: "none" }}
              className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 h-2 w-2 bg-transparent cursor-sw-resize"
            ></div>
            <div
              ref={bottomRightResizeOperator}
              onPointerDown={(e) => {
                bottomRightMouseDown(e);
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={resizeMousemoveCb}
              onPointerUp={resizeMouseupCb}
              style={{ touchAction: "none" }}
              className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 h-2 w-2 bg-transparent cursor-se-resize"
            ></div>
          </>
        )}
        <div
          ref={dialogHeaderRef}
          onDoubleClick={handleFullscreen}
          onPointerDown={(e) => {
            handleHeaderMouseDownCb?.();
            moveMousedownCb(e);
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={moveMousemoveCb}
          onPointerUp={moveMouseupCb}
          style={{ touchAction: "none" }}
          className="rounded-[inherit] rounded-b-none overflow-hidden flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800"
        >
          <div className="flex items-center space-x-2">
            <span
              className="operator w-3 h-3 bg-red-400 rounded-full cursor-pointer"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleClose}
            />
            <span
              className="operator w-3 h-3 bg-yellow-400 rounded-full cursor-pointer"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleMinimize}
            />
            <span
              className="operator w-3 h-3 bg-green-500 rounded-full cursor-pointer"
              onPointerDown={(e) => e.stopPropagation()}
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
          <div className="w-4 h-4" />
        </div>
        <div
          ref={dialogContentContainerRef}
          className="relative w-full flex-1 rounded-[inherit] rounded-t-none bg-gray-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden"
        >
          <div
            className="absolute inset-0 overflow-hidden z-0 w-dvw h-dvh origin-top-left"
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
