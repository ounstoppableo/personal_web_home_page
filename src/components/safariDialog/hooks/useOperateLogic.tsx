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
    minimizeTarget,
    onClose,
    defaultOpen,
    defaultMinimize,
    defaultFullscreen,
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
  const originalInfo = useRef({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const handleClose = () => {
    setOpen(false);
    onClose?.();
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
  const handleMinimize = contextSafe((_minimize?) => {
    const targetRect = minimizeTarget?.current?.getBoundingClientRect();
    const _handleMinimize = (minimize) => {
      if (minimize) {
        if (targetRect) {
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
    }
  });

  const handleFullscreen = () => {
    if (fullscreen) {
      widthTo.current(originalInfo.current.width);
      heightTo.current(originalInfo.current.height);
      xTo.current(originalInfo.current.x);
      yTo.current(originalInfo.current.y);
      setFullscreen(false);
    } else {
      originalInfo.current = {
        width: +gsap.getProperty(dialogRef.current, "width"),
        height: +gsap.getProperty(dialogRef.current, "height"),
        x: +gsap.getProperty(dialogRef.current, "x"),
        y: +gsap.getProperty(dialogRef.current, "y"),
      };
      widthTo.current(innerWidth);
      heightTo.current(innerHeight);
      xTo.current(0);
      yTo.current(0);
      setFullscreen(true);
    }
  };
  useEffect(() => {
    if (open !== defaultOpen) {
      handleOpenChange?.(open);
    }
  }, [open]);
  useEffect(() => {
    if (minimize !== defaultMinimize) {
      handleMinimizeChange?.(minimize);
    }
  }, [minimize]);
  useEffect(() => {
    if (fullscreen !== defaultFullscreen) {
      handleFullscreenChange?.(fullscreen);
    }
  }, [fullscreen]);
  return {
    open,
    minimize,
    fullscreen,
    handleClose,
    handleMinimize,
    handleFullscreen,
  };
}
