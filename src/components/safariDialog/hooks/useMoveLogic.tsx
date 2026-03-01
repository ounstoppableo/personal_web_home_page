/* eslint-disable react-hooks/preserve-manual-memoization */
import { setMovingOrResizing } from "@/store/dialog/dialogSlice";
import gsap from "gsap";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

export default function useMoveLogic(props: any) {
  const { dialogRef, dialogHeaderRef, xTo, yTo, fullscreen } = props;
  const moveFlag = useRef<boolean>(false);
  const mousedownPosition = useRef({ mouseX: 0, mouseY: 0, x: 0, y: 0 });
  const boundary = useRef({ top: 0, left: 0, right: 0, bottom: 0 });
  const dialogRect = useRef<any>({ width: 0, height: 0 });
  const dispatch = useDispatch();
  const mousedownCb = useCallback(
    (e: any) => {
      if (fullscreen) return;
      if (e.target.closest(".operator")) return;
      dispatch(setMovingOrResizing(true));
      moveFlag.current = true;
      mousedownPosition.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        x: +gsap.getProperty(dialogRef.current, "x"),
        y: +gsap.getProperty(dialogRef.current, "y"),
      };
      dialogRect.current = dialogRef.current.getBoundingClientRect();
      boundary.current.bottom =
        document.querySelector(".dialogBottomBoundary")?.getBoundingClientRect()
          .y - dialogHeaderRef.current.getBoundingClientRect().height || 0;
      boundary.current.right = innerWidth - dialogRect.current.width;
    },
    [fullscreen],
  );
  const mousemoveCb = useCallback(
    (e: any) => {
      if (fullscreen) return;
      if (moveFlag.current) {
        const targetX =
          mousedownPosition.current.x +
          e.clientX -
          mousedownPosition.current.mouseX;
        const targetY =
          mousedownPosition.current.y +
          e.clientY -
          mousedownPosition.current.mouseY;
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
    },
    [fullscreen],
  );
  const mouseupCb = useCallback(() => {
    moveFlag.current = false;
    dispatch(setMovingOrResizing(false));
  }, [fullscreen]);
  useEffect(() => {
    dialogRect.current = dialogRef.current.getBoundingClientRect();
  }, [fullscreen]);
  return { mousedownCb, mousemoveCb, mouseupCb };
}
