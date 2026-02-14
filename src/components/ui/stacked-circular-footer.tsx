import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "motion/react";
import {
  Component,
  Facebook,
  Github,
  Home,
  Instagram,
  Linkedin,
  MessageSquareMore,
  Newspaper,
  Twitter,
} from "lucide-react";
import { BsTelegram, BsTiktok, BsWechat } from "react-icons/bs";
import { toast } from "sonner";
import { useEffect } from "react";

function StackedCircularFooter() {
  return (
    <footer className="bg-transparent pb-[4vmin] h-full flex justify-center items-center">
      <div className="container mx-auto px-[2%] md:px-[3%]">
        <div className="flex flex-col items-center gap-[3vmin]">
          <div
            className="rounded-full w-[12vmin] overflow-hidden hover:rotate-360 transition-all duration-300 cursor-pointer"
            onClick={() => {
              (window as any).scrollSmoother?.scrollTo?.(0, true);
            }}
          >
            <img
              src="https://www.unstoppable840.cn/assets/avatar.jpeg"
              className="icon-class w-full"
            />
          </div>
          <nav className="flex flex-wrap justify-center gap-[4vmin] text-[2.5vmin] text-black">
            <motion.div
              className="flex gap-[1vmin] items-center cursor-pointer"
              whileHover={{
                scale: 1.2,
                color: "var(--themeColor)",
                transition: { duration: 0.1 },
              }}
              transition={{ duration: 0.5 }}
              onClick={() => {
                window.open(process.env.NEXT_PUBLIC_NAVG_URL);
              }}
            >
              <Home className="h-[2vmin] w-[2vmin]"></Home>
              Navg
            </motion.div>
            <motion.div
              className="flex gap-[1vmin] items-center cursor-pointer"
              whileHover={{
                scale: 1.2,
                color: "var(--themeColor)",
                transition: { duration: 0.1 },
              }}
              transition={{ duration: 0.5 }}
              onClick={() => {
                window.open(process.env.NEXT_PUBLIC_BLOG_URL);
              }}
            >
              <Newspaper className="h-[2vmin] w-[2vmin]"></Newspaper>
              Blog
            </motion.div>
            <motion.div
              className="flex gap-[1vmin] items-center cursor-pointer"
              whileHover={{
                scale: 1.2,
                color: "var(--themeColor)",
                transition: { duration: 0.1 },
              }}
              transition={{ duration: 0.5 }}
              onClick={() => {
                window.open(process.env.NEXT_PUBLIC_CHAT_URL);
              }}
            >
              <MessageSquareMore className="h-[2vmin] w-[2vmin]"></MessageSquareMore>
              Chat
            </motion.div>
            <motion.div
              className="flex gap-[1vmin] items-center cursor-pointer"
              whileHover={{
                scale: 1.2,
                color: "var(--themeColor)",
                transition: { duration: 0.1 },
              }}
              transition={{ duration: 0.5 }}
              onClick={() => {
                window.open(process.env.NEXT_PUBLIC_COMP_URL);
              }}
            >
              <Component className="h-[2vmin] w-[2vmin]"></Component>
              Comp
            </motion.div>
          </nav>
          <div className="flex space-x-[4vmin]">
            <motion.div
              className="w-fit h-fit cursor-pointer"
              whileHover={{
                scale: 1.3,
                transition: { duration: 0.1 },
              }}
              transition={{ duration: 0.5 }}
              onClick={() => {
                navigator.clipboard.writeText("unstoppable840");
                toast("交个朋友😘", {
                  description: "您已成功复制博主微信号🎉",
                  action: {
                    label: "跳转",
                    onClick: () => {
                      window.open("weixin://");
                    },
                  },
                });
              }}
            >
              <BsWechat className="h-[3vmin_!important] w-[3vmin_!important] hover:text-[var(--themeColor)] transition-all duration-300 text-black" />
              <span className="sr-only">WeChat</span>
            </motion.div>

            <motion.div
              className="w-fit h-fit cursor-pointer"
              whileHover={{
                scale: 1.3,
                transition: { duration: 0.1 },
              }}
              transition={{ duration: 0.5 }}
              onClick={() => {
                navigator.clipboard.writeText("Uns0000000");
                toast("交个朋友😘", {
                  description: "您已成功复制博主抖音号🎉",
                  action: {
                    label: "跳转",
                    onClick: () => {
                      window.open(
                        "https://www.douyin.com/user/MS4wLjABAAAAMGRrZUXRe73YTqqyHcSIM--FWZthFME5nD7xZsGt2d4?from_tab_name=main"
                      );
                    },
                  },
                });
              }}
            >
              <BsTiktok className="h-[3vmin_!important] w-[3vmin_!important] hover:text-[var(--themeColor)] transition-all duration-300 text-black" />
              <span className="sr-only">TikTok</span>
            </motion.div>
            <motion.div
              className="w-fit h-fit cursor-pointer"
              whileHover={{
                scale: 1.3,
                transition: { duration: 0.1 },
              }}
              transition={{ duration: 0.5 }}
              onClick={() => {
                navigator.clipboard.writeText("oUnstoppable840o");
                toast("交个朋友😘", {
                  description: "您已成功复制博主飞机号🎉",
                  action: {
                    label: "跳转",
                    onClick: () => {
                      window.open("https://t.me/oUnstoppable840o");
                    },
                  },
                });
              }}
            >
              <BsTelegram className="h-[3vmin_!important] w-[3vmin_!important] hover:text-[var(--themeColor)] transition-all duration-300 text-black" />
              <span className="sr-only">Telegram</span>
            </motion.div>
            <motion.div
              className="w-fit h-fit cursor-pointer text-black"
              whileHover={{
                scale: 1.3,
                transition: { duration: 0.1 },
              }}
              transition={{ duration: 0.5 }}
              onClick={() => {
                navigator.clipboard.writeText(
                  "https://github.com/ounstoppableo"
                );
                toast("交个朋友😘", {
                  description: "您已成功复制博主Github网址🎉",
                  action: {
                    label: "跳转",
                    onClick: () => {
                      window.open("https://github.com/ounstoppableo");
                    },
                  },
                });
              }}
            >
              <Github className="h-[3vmin_!important] w-[3vmin_!important] hover:text-[var(--themeColor)] transition-all duration-300" />
              <span className="sr-only">Github</span>
            </motion.div>
          </div>
          <div className="text-center">
            <p className="text-[2vmin] text-muted-foreground">
              © 2026 Unstoppable840. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { StackedCircularFooter };
