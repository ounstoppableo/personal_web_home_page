import { checkIsNone } from "@/utils/convention";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

export default function useOperateLogic(props: any) {
  const {
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
  } = props;
  const [open, setOpen] = useState(
    typeof defaultOpen === "boolean" ? defaultOpen : false
  );
  const [minimize, setMinimize] = useState(
    typeof defaultMinimize === "boolean" ? defaultMinimize : false
  );
  const [fullscreen, setFullscreen] = useState(
    typeof defaultFullscreen === "boolean" ? defaultFullscreen : false
  );
  const handleClose = () => {
    setOpen(false);
    onClose?.();
    handleOpenChange?.(false);
  };
  useEffect(() => {
    setOpen(typeof defaultOpen === "boolean" ? defaultOpen : false);
    setMinimize(typeof defaultMinimize === "boolean" ? defaultMinimize : false);
    typeof defaultMinimize === "boolean" && handleMinimize(defaultMinimize);
    setFullscreen(
      typeof defaultFullscreen === "boolean" ? defaultFullscreen : false
    );
  }, [defaultOpen, defaultMinimize, defaultFullscreen]);

  const { contextSafe } = useGSAP({
    scope: dialogRef.current,
    dependencies: [minimize],
  });
  const handleMinimize = contextSafe(async (_minimize?) => {
    const targetRect = document
      .querySelector(minimizeTargetSelector)
      ?.getBoundingClientRect?.();
    if (fullscreen) await handleFullscreen();
    const _handleMinimize = (minimize) => {
      if (minimize) {
        if (targetRect) {
          gsap.fromTo(
            dialogRef.current,
            {
              scaleX: 1,
              scaleY: 1,
              duration: 0.3,
            },
            {
              scaleX: 0,
              scaleY: 0,
              x:
                targetRect.x +
                targetRect.width / 2 -
                originalInfo.current.width / 2,
              y: targetRect.y - originalInfo.current.height / 2,
              duration: 0.3,
              ease: "power2.out",
            }
          );
        } else {
          gsap.fromTo(
            dialogRef.current,
            {
              scaleX: 1,
              scaleY: 1,
              duration: 0.3,
            },
            {
              scaleX: 0,
              scaleY: 0,
              duration: 0.3,
            }
          );
        }
      } else {
        if (targetRect) {
          checkIsNone(originalInfo.current.x) ||
          checkIsNone(originalInfo.current.y)
            ? gsap.fromTo(
                dialogRef.current,
                {
                  scaleX: 0,
                  scaleY: 0,
                  duration: 0.3,
                },
                {
                  scaleX: 1,
                  scaleY: 1,
                  duration: 0.3,
                  onComplete: refreshContentSize,
                }
              )
            : gsap.fromTo(
                dialogRef.current,
                {
                  scaleX: 0,
                  scaleY: 0,
                  duration: 0.3,
                },
                {
                  scaleX: 1,
                  scaleY: 1,
                  x: originalInfo.current.x,
                  y: originalInfo.current.y,
                  duration: 0.3,
                  onComplete: refreshContentSize,
                }
              );
        } else {
          gsap.fromTo(
            dialogRef.current,
            {
              scaleX: 0,
              scaleY: 0,
              duration: 0.3,
            },
            {
              scaleX: 1,
              scaleY: 1,
              duration: 0.3,
            }
          );
        }
      }
    };
    if (typeof _minimize === "boolean") {
      _handleMinimize(_minimize);
    } else {
      setMinimize(!minimize);
      _handleMinimize(!minimize);
      handleMinimizeChange?.(!minimize);
    }
  });

  const handleFullscreen = async () => {
    if (fullscreen) {
      await gsap.to(dialogRef.current, {
        width: originalInfo.current.width,
        height: originalInfo.current.height,
        x: originalInfo.current.x,
        y: originalInfo.current.y,
        duration: 0.1,
        onComplete: refreshContentSize,
      });
      setFullscreen(false);
      handleFullscreenChange?.(false);
    } else {
      await gsap.to(dialogRef.current, {
        width: innerWidth,
        height: innerHeight,
        x: 0,
        y: 0,
        duration: 0.1,
        onComplete: refreshContentSize,
      });
      setFullscreen(true);
      handleFullscreenChange?.(true);
    }
  };

  return {
    open,
    minimize,
    fullscreen,
    handleClose,
    handleMinimize,
    handleFullscreen,
  };
}
