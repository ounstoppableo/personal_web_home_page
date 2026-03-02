"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Blocks,
  Bubbles,
  Check,
  Moon,
  Palette,
  PanelsTopLeft,
  Settings,
  SquareArrowOutUpRight,
  Sun,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { initMessageTool as fetchInitMessageTool } from "@/utils/fetch";
import { App } from "antd";
import { Button } from "./ui/button";
import { closedFloat, seasonSelect } from "@/utils/seasonFloat";
import { useDispatch, useSelector } from "react-redux";
import { setAppOpenMethod, setDarkMode } from "@/store/setting/settingSlice";
import gsap from "gsap";

export default function Settiing(props: any) {
  const { showSetting } = props;
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [moveFlag, setMoveFlag] = useState(false);
  const darkMode = useSelector((state: any) => state.setting.darkMode);
  const menuContainerRef = useRef(null);
  const triggerBtnRef = useRef(null);
  const triggerBtnRect = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const xTo = useRef<any>(() => {});
  const yTo = useRef<any>(() => {});
  useEffect(() => {
    triggerBtnRect.current = triggerBtnRef.current.getBoundingClientRect();
    const macOsDockRect = document
      .querySelector("#macOsDock")
      .getBoundingClientRect();
    gsap.set(menuContainerRef.current, {
      x:
        innerWidth -
        Math.min(innerHeight, innerWidth) * 0.06 -
        triggerBtnRect.current.width,
      y:
        macOsDockRect.y +
        macOsDockRect.height / 2 -
        triggerBtnRect.current.height / 2,
    });
    xTo.current = gsap.quickTo(menuContainerRef.current, "x", {
      duration: 0.1,
    });
    yTo.current = gsap.quickTo(menuContainerRef.current, "y", {
      duration: 0.1,
    });
    const resizeCb = () => {
      requestAnimationFrame(() => {
        triggerBtnRect.current = triggerBtnRef.current.getBoundingClientRect();
        const macOsDockRect = document
          .querySelector("#macOsDock")
          .getBoundingClientRect();
        gsap.set(menuContainerRef.current, {
          x:
            innerWidth -
            Math.min(innerHeight, innerWidth) * 0.06 -
            triggerBtnRect.current.width,
          y:
            macOsDockRect.y +
            macOsDockRect.height / 2 -
            triggerBtnRect.current.height / 2,
        });
      });
    };

    window.addEventListener("resize", resizeCb);
    return () => {
      window.removeEventListener("resize", resizeCb);
    };
  }, []);

  const appOpenMethod = useSelector(
    (state: any) => state.setting.appOpenMethod
  );
  const dispatch = useDispatch();
  useEffect(() => {
    fetchInitMessageTool(message);
  }, []);

  const [floatOpenStatus, setFloatOpenStatus] = useState<boolean>(
    localStorage.getItem("floatClose") ? false : true
  );

  const checkSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month === 10 || month === 11 || month === 12 || month === 1) {
      return "Winter";
    } else if (month === 8 || month === 9) {
      return "Autumn";
    } else if (month === 5 || month === 6 || month === 7) {
      return "Summer";
    } else {
      return "Spring";
    }
  };
  const handleOpenFloatEffect = () => {
    if (floatOpenStatus) {
      closedFloat();
      setFloatOpenStatus(false);
      localStorage.setItem("floatClose", "true");
    } else {
      const season = checkSeason();
      seasonSelect(season);
      setFloatOpenStatus(true);
      localStorage.setItem("floatClose", "");
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("floatClose")) {
      const season = checkSeason();
      seasonSelect(season);
    }
  }, []);

  // 暗黑模式持久化
  useEffect(() => {
    const localDarkMode = localStorage.getItem("darkMode");
    dispatch(setDarkMode(localDarkMode === "false" ? false : true));
  }, []);
  useEffect(() => {
    if (typeof darkMode === "boolean") {
      darkMode
        ? document.documentElement.classList.add("dark")
        : document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <AnimatePresence>
      {showSetting && (
        <motion.div
          ref={menuContainerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed top-0 left-0 z-[calc(var(--maxZIndex)+1)]"
        >
          <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
              asChild
              style={{ touchAction: "none" }}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMoveFlag(true);
                setOpen(false);
                triggerBtnRect.current =
                  triggerBtnRef.current.getBoundingClientRect();
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerUp={(e) => {
                setMoveFlag(false);
                e.currentTarget.releasePointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (moveFlag) {
                  xTo.current(e.clientX - triggerBtnRect.current.width / 2);
                  yTo.current(e.clientY - triggerBtnRect.current.height / 2);
                }
              }}
            >
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full cursor-pointer"
                ref={triggerBtnRef}
                onClick={() => {
                  setOpen(!open);
                }}
              >
                <Settings className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={"top"}
              className="w-48 z-[calc(var(--maxZIndex)+1)]"
            >
              <DropdownMenuItem
                className="flex items-center gap-2 rounded-lg py-2 px-2 hover:bg-background/50"
                onClick={handleOpenFloatEffect}
              >
                <Bubbles className="w-4 h-4" />
                <div className="flex-1">落花效果</div>
                {floatOpenStatus && <Check className="h-4 w-4"></Check>}
              </DropdownMenuItem>
              <DropdownMenuSeparator></DropdownMenuSeparator>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2 rounded-lg py-2 px-2 hover:bg-background/50">
                  <Blocks className="w-4 h-4" />
                  <span className="flex-1">应用模式</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-44 rounded-lg border shadow-sm p-1 z-[calc(var(--maxZIndex)+1)]">
                    <DropdownMenuRadioGroup value="light">
                      <DropdownMenuRadioItem
                        value="light"
                        className="flex items-center gap-2 py-1 px-2 rounded"
                        onClick={() => {
                          dispatch(setAppOpenMethod("inner"));
                        }}
                      >
                        <PanelsTopLeft className="w-4 h-4" />
                        <span className="flex-1">内部打开</span>
                        {appOpenMethod === "inner" ? (
                          <Check className="h-4 w-4"></Check>
                        ) : (
                          <></>
                        )}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem
                        value="dark"
                        className="flex items-center gap-2 py-1 px-2 rounded"
                        onClick={() => {
                          dispatch(setAppOpenMethod("outer"));
                        }}
                      >
                        <SquareArrowOutUpRight className="w-4 h-4" />
                        <span className="flex-1">外部打开</span>
                        {appOpenMethod === "outer" ? (
                          <Check className="h-4 w-4"></Check>
                        ) : (
                          <></>
                        )}
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2 rounded-lg py-2 px-2 hover:bg-background/50">
                  <Palette className="w-4 h-4" />
                  <span className="flex-1">主题管理</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-44 rounded-lg border shadow-sm p-1 z-[var(--maxZIndex)]">
                    <DropdownMenuRadioGroup value="light">
                      <DropdownMenuRadioItem
                        value="light"
                        className="flex items-center gap-2 py-1 px-2 rounded"
                        onClick={() => {
                          localStorage.setItem(
                            "darkMode",
                            JSON.stringify(false)
                          );
                          dispatch(setDarkMode(false));
                        }}
                      >
                        <Sun className="w-4 h-4" />
                        <span className="flex-1">亮色模式</span>
                        {darkMode ? <></> : <Check className="h-4 w-4"></Check>}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem
                        value="dark"
                        className="flex items-center gap-2 py-1 px-2 rounded"
                        onClick={() => {
                          localStorage.setItem(
                            "darkMode",
                            JSON.stringify(true)
                          );
                          dispatch(setDarkMode(true));
                        }}
                      >
                        <Moon className="w-4 h-4" />
                        <span className="flex-1">暗黑模式</span>
                        {darkMode ? <Check className="h-4 w-4"></Check> : <></>}
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
