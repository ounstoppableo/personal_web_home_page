import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function useResizeLogic(props: any) {
  const { dialogRef, widthTo, heightTo, xTo, yTo } = props;
  const topResizeOperator = useRef(null);
  const leftResizeOperator = useRef(null);
  const rightResizeOperator = useRef(null);
  const bottomResizeOperator = useRef(null);
  const topLeftResizeOperator = useRef(null);
  const bottomLeftResizeOperator = useRef(null);
  const topRightResizeOperator = useRef(null);
  const bottomRightResizeOperator = useRef(null);

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
  useEffect(() => {
    const mousedownBasic = (e) => {
      mousedownPosition.current = {
        mouseX: e.x,
        mouseY: e.y,
        width: +gsap.getProperty(dialogRef.current, "width"),
        height: +gsap.getProperty(dialogRef.current, "height"),
        x: +gsap.getProperty(dialogRef.current, "x"),
        y: +gsap.getProperty(dialogRef.current, "y"),
      };
      basicInfo.current = {
        innerHeight: innerHeight,
        innerWidth: innerWidth,
      };
    };
    const topMouseDown = (e) => {
      resizeFlag.current = "top";
      mousedownBasic(e);
    };
    const bottomMouseDown = (e) => {
      resizeFlag.current = "bottom";
      mousedownBasic(e);
    };
    const leftMouseDown = (e) => {
      resizeFlag.current = "left";
      mousedownBasic(e);
    };
    const rightMouseDown = (e) => {
      resizeFlag.current = "right";
      mousedownBasic(e);
    };
    const topLeftMouseDown = (e) => {
      resizeFlag.current = "topLeft";
      mousedownBasic(e);
    };
    const topRightMouseDown = (e) => {
      resizeFlag.current = "topRight";
      mousedownBasic(e);
    };
    const bottomLeftMouseDown = (e) => {
      resizeFlag.current = "bottomLeft";
      mousedownBasic(e);
    };
    const bottomRightMouseDown = (e) => {
      resizeFlag.current = "bottomRight";
      mousedownBasic(e);
    };
    topResizeOperator.current.addEventListener("mousedown", topMouseDown);
    bottomResizeOperator.current.addEventListener("mousedown", bottomMouseDown);
    leftResizeOperator.current.addEventListener("mousedown", leftMouseDown);
    rightResizeOperator.current.addEventListener("mousedown", rightMouseDown);
    topLeftResizeOperator.current.addEventListener(
      "mousedown",
      topLeftMouseDown,
    );
    topRightResizeOperator.current.addEventListener(
      "mousedown",
      topRightMouseDown,
    );
    bottomLeftResizeOperator.current.addEventListener(
      "mousedown",
      bottomLeftMouseDown,
    );
    bottomRightResizeOperator.current.addEventListener(
      "mousedown",
      bottomRightMouseDown,
    );
    const mousemoveCb = (e) => {
      if (resizeFlag.current) {
        const targetX =
          mousedownPosition.current.x + e.x - mousedownPosition.current.mouseX;
        const targetY =
          mousedownPosition.current.y + e.y - mousedownPosition.current.mouseY;

        const topCb = () => {
          const targetHeight =
            mousedownPosition.current.height -
            (e.y - mousedownPosition.current.mouseY);
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
            e.y -
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
            (e.x - mousedownPosition.current.mouseX);
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
            e.x -
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
    };
    const mouseupCb = () => {
      resizeFlag.current = "";
    };
    window.addEventListener("mousemove", mousemoveCb);
    window.addEventListener("mouseup", mouseupCb);
    return () => {
      window.removeEventListener("mousemove", mousemoveCb);
      window.removeEventListener("mouseup", mouseupCb);
      topResizeOperator.current?.removeEventListener("mousedown", topMouseDown);
      bottomResizeOperator.current?.removeEventListener(
        "mousedown",
        bottomMouseDown,
      );
      leftResizeOperator.current?.removeEventListener(
        "mousedown",
        leftMouseDown,
      );
      rightResizeOperator.current?.removeEventListener(
        "mousedown",
        rightMouseDown,
      );
      topLeftResizeOperator.current?.removeEventListener(
        "mousedown",
        topLeftMouseDown,
      );
      topRightResizeOperator.current?.removeEventListener(
        "mousedown",
        topRightMouseDown,
      );
      bottomLeftResizeOperator.current?.removeEventListener(
        "mousedown",
        bottomLeftMouseDown,
      );
      bottomRightResizeOperator.current?.removeEventListener(
        "mousedown",
        bottomRightMouseDown,
      );
    };
  }, []);
  return {
    topResizeOperator,
    leftResizeOperator,
    rightResizeOperator,
    bottomResizeOperator,
    topLeftResizeOperator,
    bottomLeftResizeOperator,
    topRightResizeOperator,
    bottomRightResizeOperator,
  };
}
