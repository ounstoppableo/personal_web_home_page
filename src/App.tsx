import { useEffect, useState } from "react";
import "./App.css";
import request from "./utils/fetch";
import type { CommonResponse } from "./types/response";
import { codeMap } from "./utils/backendStatus";
import MacOSDock from "./components/mac-os-dock";
import dayjs from "dayjs";
import solarLunar from "solarLunar";
import Settiing from "./components/Setting";

function App() {
  const [background, setBackground] = useState<string>("");
  const initApps = [
    {
      id: "Blog",
      name: "Blog",
      icon: "/blog.webp",
    },
    {
      id: "ChatPlatform",
      name: "ChatPlatform",
      icon: "/chat.webp",
    },
    {
      id: "ComponentLibrary",
      name: "ComponentLibrary",
      icon: "/component.webp",
    },
    {
      id: "MediaLibrary",
      name: "MediaLibrary",
      icon: "/mediaLibrary.webp",
    },
    {
      id: "GitHub",
      name: "GitHub",
      icon: "/github.webp",
    },
    {
      id: "Blog5",
      name: "Blog",
      icon: "/blog.webp",
    },
    {
      id: "ChatPlatform4",
      name: "ChatPlatform",
      icon: "/chat.webp",
    },
    {
      id: "ComponentLibrary3",
      name: "ComponentLibrary",
      icon: "/component.webp",
    },
    {
      id: "MediaLibrary2",
      name: "MediaLibrary",
      icon: "/mediaLibrary.webp",
    },
    {
      id: "GitHub1",
      name: "GitHub",
      icon: "/github.webp",
    },
    {
      id: "Blog51",
      name: "Blog",
      icon: "/blog.webp",
    },
    {
      id: "ChatPlatform41",
      name: "ChatPlatform",
      icon: "/chat.webp",
    },
    {
      id: "ComponentLibrary31",
      name: "ComponentLibrary",
      icon: "/component.webp",
    },
    {
      id: "MediaLibrary21",
      name: "MediaLibrary",
      icon: "/mediaLibrary.webp",
    },
    {
      id: "GitHub11",
      name: "GitHub",
      icon: "/github.webp",
    },
    {
      id: "Blog51",
      name: "Blog",
      icon: "/blog.webp",
    },
    {
      id: "ChatPlatform41",
      name: "ChatPlatform",
      icon: "/chat.webp",
    },
    {
      id: "ComponentLibrary31",
      name: "ComponentLibrary",
      icon: "/component.webp",
    },
    {
      id: "MediaLibrary21",
      name: "MediaLibrary",
      icon: "/mediaLibrary.webp",
    },
    {
      id: "GitHub91",
      name: "GitHub",
      icon: "/github.webp",
    },

    {
      id: "Blog61",
      name: "Blog",
      icon: "/blog.webp",
    },
    {
      id: "ChatPlatform51",
      name: "ChatPlatform",
      icon: "/chat.webp",
    },
    {
      id: "ComponentLibrary41",
      name: "ComponentLibrary",
      icon: "/component.webp",
    },
    {
      id: "MediaLibrary31",
      name: "MediaLibrary",
      icon: "/mediaLibrary.webp",
    },
    {
      id: "GitHub21",
      name: "GitHub",
      icon: "/github.webp",
    },
    {
      id: "Blog111",
      name: "Blog",
      icon: "/blog.webp",
    },
    {
      id: "ChatPlatform141",
      name: "ChatPlatform",
      icon: "/chat.webp",
    },
    {
      id: "ComponentLibrary131",
      name: "ComponentLibrary",
      icon: "/component.webp",
    },
    {
      id: "MediaLibrary121",
      name: "MediaLibrary",
      icon: "/mediaLibrary.webp",
    },
    {
      id: "GitHub111",
      name: "GitHub",
      icon: "/github.webp",
    },
    {
      id: "Blog1111",
      name: "Blog",
      icon: "/blog.webp",
    },
    {
      id: "ChatPlatform1141",
      name: "ChatPlatform",
      icon: "/chat.webp",
    },
    {
      id: "ComponentLibrary1131",
      name: "ComponentLibrary",
      icon: "/component.webp",
    },
    {
      id: "MediaLibrary1121",
      name: "MediaLibrary",
      icon: "/mediaLibrary.webp",
    },
    {
      id: "GitHub2111",
      name: "GitHub",
      icon: "/github.webp",
    },
  ];

  useEffect(() => {
    request("/api/media/randomByTag", {
      method: "post",
      body: {
        count: 1,
        tags: ["Background"],
      },
    }).then((res: CommonResponse) => {
      console.log(res);
      if (res.code === codeMap.success) {
        setBackground(res.data[0].sourcePath);
      }
    });
  }, []);
  const now = new Date();
  const [timeInfo, setTimeInfo] = useState<any>({
    default: dayjs(now).format("YYYY-MM-DD HH:mm:ss"),
    lunar: solarLunar.solar2lunar(
      dayjs(now).format("YYYY"),
      dayjs(now).format("MM"),
      dayjs(now).format("DD"),
    ),
  });
  const updateTimeInfo = () => {
    const now = new Date();
    setTimeInfo({
      default: dayjs(now).format("YYYY-MM-DD HH:mm:ss"),
      lunar: solarLunar.solar2lunar(
        dayjs(now).format("YYYY"),
        dayjs(now).format("MM"),
        dayjs(now).format("DD"),
      ),
    });
  };
  useEffect(() => {
    const interval = setInterval(updateTimeInfo, 60000);
    return () => clearInterval(interval);
  }, []);

  const [showSetting] = useState<boolean>(true);

  return (
    <>
      <div className="w-dvw h-dvh relative">
        <div className="absolute right-[8vmin] bottom-[6vmin]">
          <Settiing showSetting={showSetting}></Settiing>
        </div>
        {background && (
          <>
            <img
              className="object-cover absolute inset-0 w-full h-full overflow-hidden -z-2"
              src={`/image${background}`}
            ></img>
            <div className="absolute inset-0 w-full h-full overflow-hidden -z-1 bg-black/20"></div>
          </>
        )}
        <div className="w-full h-full overflow-hidden flex justify-between items-center flex-col px-[6vmin] pt-[8vmin] pb-[2vmin]">
          {timeInfo.default && (
            <div className="select-none flex flex-col items-center text-shadow-lg gap-[1vmin] mt-[6vmin]">
              <div className="text-[12vmin] leading-[12vmin] font-extrabold text-white text-center flex items-center gap-[1vmin]">
                <div>
                  {+dayjs(timeInfo.default).format("HH") > 12
                    ? +dayjs(timeInfo.default).format("HH") - 12
                    : dayjs(timeInfo.default).format("HH")}
                </div>
                <div>:</div>
                <div>{dayjs(timeInfo.default).format("mm")}</div>
                <div className="ml-[1vmin] text-[4vmin] leading-[6vmin] text-gray-200 self-end">
                  {dayjs(timeInfo.default).format("A")}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex text-gray-300 gap-[1vmin] text-[2.5vmin]">
                  <div>{timeInfo.lunar.gzYear}年</div>
                  <div>
                    {timeInfo.lunar.gzMonth}月{timeInfo.lunar.dayCn}
                  </div>
                </div>
                <div className="flex text-gray-200 gap-[1vmin] text-[3vmin]">
                  <div>{dayjs(timeInfo.default).format("M月D日")}</div>
                  <div>{timeInfo.lunar.ncWeek}</div>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col justify-center items-center gap-[2vmin] select-none">
            <MacOSDock
              initApps={initApps}
              onAppClick={(appId) => console.log(appId)}
            />
            <div className="text-center">
              <p className="text-[2vmin] text-white">
                © 2026 Unstoppable840. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
