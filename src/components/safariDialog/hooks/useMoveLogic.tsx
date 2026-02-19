import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function useMoveLogic(props: any) {
  const { dialogRef, dialogHeaderRef, xTo, yTo } = props;
  const moveFlag = useRef<boolean>(false);
  const mousedownPosition = useRef({ mouseX: 0, mouseY: 0, x: 0, y: 0 });
  const boundary = useRef({ top: 0, left: 0, right: 0, bottom: 0 });
  const dialogRect = useRef<any>({});
  useEffect(() => {
    dialogRect.current = dialogRef.current.getBoundingClientRect();
    gsap.set(dialogRef.current, {
      x: innerWidth / 2 - dialogRect.current.width / 2,
      y: innerHeight / 2 - dialogRect.current.height / 2,
    });
    const mousedownCb = (e: any) => {
      moveFlag.current = true;
      mousedownPosition.current = {
        mouseX: e.x,
        mouseY: e.y,
        x: +gsap.getProperty(dialogRef.current, "x"),
        y: +gsap.getProperty(dialogRef.current, "y"),
      };
      dialogRect.current = dialogRef.current.getBoundingClientRect();
      boundary.current.bottom =
        document.querySelector(".dialogBottomBoundary")?.getBoundingClientRect()
          .y - dialogHeaderRef.current.getBoundingClientRect().height || 0;
      boundary.current.right = innerWidth - dialogRect.current.width;
    };
    const mousemoveCb = (e: any) => {
      if (moveFlag.current) {
        const targetX =
          mousedownPosition.current.x + e.x - mousedownPosition.current.mouseX;
        const targetY =
          mousedownPosition.current.y + e.y - mousedownPosition.current.mouseY;
        if (
          targetY > boundary.current.bottom ||
          targetY < boundary.current.top
        ) {
          if (targetY < boundary.current.top) {
            yTo.current(boundary.current.top);
          } else if (targetY > boundary.current.bottom) {
            yTo.current(boundary.current.bottom);
          }
        } else {
          yTo.current(targetY);
        }
        if (
          targetX < boundary.current.left ||
          targetX > boundary.current.right
        ) {
          if (targetX < boundary.current.left) {
            xTo.current(boundary.current.left);
          } else if (targetX > boundary.current.right) {
            xTo.current(boundary.current.right);
          }
        } else {
          xTo.current(targetX);
        }
      }
    };
    const mouseupCb = () => {
      moveFlag.current = false;
    };
    dialogHeaderRef.current.addEventListener("mousedown", mousedownCb);
    window.addEventListener("mousemove", mousemoveCb);
    window.addEventListener("mouseup", mouseupCb);
    return () => {
      dialogHeaderRef.current?.removeEventListener("mousedown", mousedownCb);
      window.removeEventListener("mousemove", mousemoveCb);
      window.removeEventListener("mouseup", mouseupCb);
    };
  }, []);
  return {};
}
