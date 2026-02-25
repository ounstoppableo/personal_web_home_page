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
} from "@/components/ui/dropdown-menu";
import {
  Blocks,
  Bubbles,
  Check,
  IndianRupee,
  Menu,
  Outdent,
  PanelsTopLeft,
  Settings,
  SquareArrowOutUpRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { initMessageTool as fetchInitMessageTool } from "@/utils/fetch";
import { App } from "antd";
import { Button } from "./ui/button";
import { closedFloat, seasonSelect } from "@/utils/seasonFloat";
import { useDispatch, useSelector } from "react-redux";
import { setAppOpenMethod } from "@/store/setting/settingSlice";

export default function Settiing(props: any) {
  const { showSetting } = props;
  const { message } = App.useApp();
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

  return (
    <AnimatePresence>
      {showSetting && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-[6vmin] right-[6vmin] z-[calc(var(--maxZIndex)-1)]"
        >
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full cursor-pointer"
              >
                <Settings className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 z-[calc(var(--maxZIndex)-1)]">
              <DropdownMenuItem
                className="flex items-center gap-2 rounded-lg py-2 px-2 hover:bg-background/50"
                onClick={handleOpenFloatEffect}
              >
                <Bubbles className="w-4 h-4" />
                <div className="flex-1">落花效果</div>
                {floatOpenStatus && <Check className="h-4 w-4"></Check>}
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2 rounded-lg py-2 px-2 hover:bg-background/50">
                  <Blocks className="w-4 h-4" />
                  <span className="flex-1">应用模式</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-44 rounded-lg border shadow-sm p-1 z-[var(--maxZIndex)]">
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
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
