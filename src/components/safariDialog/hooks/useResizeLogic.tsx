/* eslint-disable react-hooks/preserve-manual-memoization */
import { setMovingOrResizing } from "@/store/dialog/dialogSlice";
import gsap from "gsap";
import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";

export default function useResizeLogic(props: any) {
  const { dialogRef, widthTo, heightTo, xTo, yTo, fullscreen } = props;
  const topResizeOperator = useRef(null);
  const leftResizeOperator = useRef(null);
  const rightResizeOperator = useRef(null);
  const bottomResizeOperator = useRef(null);
  const topLeftResizeOperator = useRef(null);
  const bottomLeftResizeOperator = useRef(null);
  const topRightResizeOperator = useRef(null);
  const bottomRightResizeOperator = useRef(null);
  const diapatch = useDispatch();

  const basicInfo = useRef<any>({ innerHeight: 0, innerWidth: 0 });
  const resizeFlag = useRef<
    | "top"
    | "topLeft"
    | "topRight"
    | "bottom"
    | "bottomLeft"
    | "bottomRight"
    | "left"
    | "right"
    | ""
  >("");
  const mousedownPosition = useRef({
    mouseX: 0,
    mouseY: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  const mousedownBasic = useCallback(
    (e) => {
      diapatch(setMovingOrResizing(true));
      mousedownPosition.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        width: +gsap.getProperty(dialogRef.current, "width"),
        height: +gsap.getProperty(dialogRef.current, "height"),
        x: +gsap.getProperty(dialogRef.current, "x"),
        y: +gsap.getProperty(dialogRef.current, "y"),
      };
      basicInfo.current = {
        innerHeight: innerHeight,
        innerWidth: innerWidth,
      };
    },
    [fullscreen],
  );
  const topMouseDown = useCallback(
    (e) => {
      resizeFlag.current = "top";
      mousedownBasic(e);
    },
    [fullscreen],
  );
  const bottomMouseDown = useCallback(
    (e) => {
      resizeFlag.current = "bottom";
      mousedownBasic(e);
    },
    [fullscreen],
  );
  const leftMouseDown = useCallback(
    (e) => {
      resizeFlag.current = "left";
      mousedownBasic(e);
    },
    [fullscreen],
  );
  const rightMouseDown = useCallback(
    (e) => {
      resizeFlag.current = "right";
      mousedownBasic(e);
    },
    [fullscreen],
  );
  const topLeftMouseDown = useCallback(
    (e) => {
      resizeFlag.current = "topLeft";
      mousedownBasic(e);
    },
    [fullscreen],
  );
  const topRightMouseDown = useCallback(
    (e) => {
      resizeFlag.current = "topRight";
      mousedownBasic(e);
    },
    [fullscreen],
  );
  const bottomLeftMouseDown = useCallback(
    (e) => {
      resizeFlag.current = "bottomLeft";
      mousedownBasic(e);
    },
    [fullscreen],
  );
  const bottomRightMouseDown = useCallback(
    (e) => {
      resizeFlag.current = "bottomRight";
      mousedownBasic(e);
    },
    [fullscreen],
  );

  const mousemoveCb = useCallback(
    (e: any) => {
      if (resizeFlag.current) {
        const targetX =
          mousedownPosition.current.x +
          e.clientX -
          mousedownPosition.current.mouseX;
        const targetY =
          mousedownPosition.current.y +
          e.clientY -
          mousedownPosition.current.mouseY;

        const topCb = () => {
          const targetHeight =
            mousedownPosition.current.height -
            (e.clientY - mousedownPosition.current.mouseY);
          if (targetHeight < basicInfo.current.innerHeight / 2) return;
          if (targetY < 0) {
            yTo.current(0);
            heightTo.current(targetHeight - (0 - targetY));
          } else {
            yTo.current(targetY);
            heightTo.current(targetHeight);
          }
        };
        const bottomCb = () => {
          const targetHeight =
            mousedownPosition.current.height +
            e.clientY -
            mousedownPosition.current.mouseY;
          if (targetHeight < basicInfo.current.innerHeight / 2) return;
          if (
            mousedownPosition.current.y + targetHeight >
            basicInfo.current.innerHeight
          ) {
            heightTo.current(
              basicInfo.current.innerHeight - mousedownPosition.current.y,
            );
          } else {
            heightTo.current(targetHeight);
          }
        };
        const leftCb = () => {
          const targetWidth =
            mousedownPosition.current.width -
            (e.clientX - mousedownPosition.current.mouseX);
          if (targetWidth < basicInfo.current.innerWidth / 2) return;
          if (targetX < 0) {
            xTo.current(0);
            widthTo.current(targetWidth - (0 - targetX));
          } else {
            xTo.current(targetX);
            widthTo.current(targetWidth);
          }
        };
        const rightCb = () => {
          const targetWidth =
            mousedownPosition.current.width +
            e.clientX -
            mousedownPosition.current.mouseX;
          if (targetWidth < basicInfo.current.innerWidth / 2) return;
          if (
            mousedownPosition.current.x + targetWidth >
            basicInfo.current.innerWidth
          ) {
            widthTo.current(
              basicInfo.current.innerWidth - mousedownPosition.current.x,
            );
          } else {
            widthTo.current(targetWidth);
          }
        };
        switch (resizeFlag.current) {
          case "top":
            topCb();
            break;
          case "bottom":
            bottomCb();
            break;
          case "left":
            leftCb();
            break;
          case "right":
            rightCb();
            break;
          case "topLeft":
            topCb();
            leftCb();
            break;
          case "topRight":
            topCb();
            rightCb();
            break;
          case "bottomLeft":
            bottomCb();
            leftCb();
            break;
          case "bottomRight":
            bottomCb();
            rightCb();
            break;
        }
      }
    },
    [fullscreen],
  );
  const mouseupCb = useCallback(() => {
    resizeFlag.current = "";
    diapatch(setMovingOrResizing(false));
  }, [fullscreen]);

  return {
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
    mousemoveCb,
    mouseupCb,
  };
}
