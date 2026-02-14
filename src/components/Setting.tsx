import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bubbles, Check, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { initMessageTool as fetchInitMessageTool } from "@/utils/fetch";
import { App } from "antd";
import { Button } from "./ui/button";
import { closedFloat, seasonSelect } from "@/utils/seasonFloat";

export default function Settiing(props: any) {
  const { showSetting } = props;
  const { message } = App.useApp();
  useEffect(() => {
    fetchInitMessageTool(message);
  }, []);

  const [floatOpenStatus, setFloatOpenStatus] = useState<boolean>(true);
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
    } else {
      seasonSelect(checkSeason());

      setFloatOpenStatus(true);
    }
  };
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
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
