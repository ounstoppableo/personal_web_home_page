import { useEffect, useRef, useState } from "react";
import "./App.css";
import request, { initMessageTool } from "./utils/fetch";
import type { CommonResponse } from "./types/response";
import { codeMap } from "./utils/backendStatus";
import MacOSDock from "./components/mac-os-dock";
import dayjs from "dayjs";
import solarLunar from "solarlunar";
import Settiing from "./components/Setting";
import SafariDialog from "./components/safariDialog";
import { useSelector } from "react-redux";
import {
  deleteIframe,
  iframeCommunicationListener,
  sendMessageToIframe,
} from "./utils/iframeCommunication/client";
import Loading from "./components/loading/loading";
import MusicPlayer from "./components/musicPlayer";
import { App } from "antd";
import TiltCard from "./components/3d-tilt-card";
import StatsCardWithData from "./components/statsCard/stats-card-with-data";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable, InertiaPlugin } from "gsap/all";
gsap.registerPlugin(Draggable);
gsap.registerPlugin(InertiaPlugin);

export default function Layout() {
  const [background, setBackground] = useState<string>("");
  const { message } = App.useApp();
  useEffect(() => {
    initMessageTool(message);
  }, [message]);
  const initApps = [
    {
      id: "Blog",
      name: "我的博客",
      icon: "/blog.webp",
      url: import.meta.env.VITE_BLOG_URL,
    },
    {
      id: "ChatPlatform",
      name: "聊天平台",
      icon: "/chat.webp",
      url: import.meta.env.VITE_CHATPLATFORM_URL,
    },
    {
      id: "ComponentLibrary",
      name: "组件库",
      icon: "/component.webp",
      url: import.meta.env.VITE_COMPONENTLIBRARY_URL,
    },
    {
      id: "MediaLibrary",
      name: "媒体库",
      icon: "/mediaLibrary.webp",
      url: import.meta.env.VITE_MEDIALIBRARY_URL,
    },
    {
      id: "GitHub",
      name: "GitHub",
      icon: "/github.webp",
      url: import.meta.env.VITE_GITHUB_URL,
      appOpenMethod: "outer",
    },
    {
      id: "TikTok",
      name: "抖音",
      icon: "/tiktok.webp",
      url: import.meta.env.VITE_TIKTOK_URL,
      appOpenMethod: "outer",
    },
    {
      id: "Telegram",
      name: "Telegram",
      icon: "/telegram.webp",
      url: import.meta.env.VITE_TELEGRAM_URL,
      appOpenMethod: "outer",
    },
  ];
  const macOsDockRef = useRef(null);
  const appOpenMethod = useSelector(
    (state: any) => state.setting.appOpenMethod
  );
  const [musicList, setMusicList] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(true);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    token && localStorage.setItem("token", token);
    window.history.replaceState({}, "", window.location.pathname);
    if (window.location.pathname !== "/") {
      window.history.replaceState({}, "", "/");
    }
  }, []);
  useEffect(() => {
    request("/apiFromMedia/media/randomByTag", {
      method: "post",
      body: {
        count: 1,
        tags: ["Background"],
      },
    })
      .then((res: CommonResponse) => {
        if (res.code === codeMap.success) {
          if (res.data[0]) {
            setBackground(`/imageFromMedia${res.data[0].sourcePath}`);
          } else {
            setBackground("/default_background.jpg");
          }
        } else {
          setBackground("/default_background.jpg");
        }
      })
      .catch(() => {
        setBackground("/default_background.jpg");
      });
    request("/api/getMusicInfo").then((res) => {
      if ((res as any).code === 200) {
        setMusicList((res as any).result);
      }
    });
  }, []);
  const now = new Date();
  const [timeInfo, setTimeInfo] = useState<any>({
    default: dayjs(now).format("YYYY-MM-DD HH:mm:ss"),
    lunar: solarLunar.solar2lunar(
      dayjs(now).format("YYYY"),
      dayjs(now).format("MM"),
      dayjs(now).format("DD")
    ),
  });
  const updateTimeInfo = () => {
    const now = new Date();
    setTimeInfo({
      default: dayjs(now).format("YYYY-MM-DD HH:mm:ss"),
      lunar: solarLunar.solar2lunar(
        dayjs(now).format("YYYY"),
        dayjs(now).format("MM"),
        dayjs(now).format("DD")
      ),
    });
  };
  useEffect(() => {
    const interval = setInterval(updateTimeInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  const dialogContainerRef = useRef(null);
  const dialogRootContainerRef = useRef(null);
  const [dialogList, _setDialogList] = useState([]);
  const dialogListSync = useRef(dialogList);
  const darkMode = useSelector((state: any) => state.setting.darkMode);
  const setDialogList = (value) => {
    dialogListSync.current = value;
    _setDialogList(value);
  };
  const onAppClick = (app) => {
    if (appOpenMethod === "outer" || app.appOpenMethod === "outer") {
      window.open(app.url);
      macOsDockRef.current.handleAppClick(app.id, false);
    } else {
      const _set = new Set(dialogList.map((item) => item.id));
      if (!_set.has(app.id)) {
        setDialogList([
          ...dialogListSync.current.map((item) => ({
            ...item,
            zIndex: 1,
          })),
          {
            ...app,
            minimizeTargetSelector: `#${app.id}`,
            open: true,
            minimize: false,
            loading: true,
            zIndex: 2,
          },
        ]);
      } else {
        const index = dialogList.findIndex((item) => item.id === app.id);
        setDialogList([
          ...dialogListSync.current
            .slice(0, index)
            .map((item) => ({ ...item, zIndex: 1 })),
          {
            ...dialogListSync.current[index],
            minimize: !dialogListSync.current[index].minimize,
            zIndex: 2,
          },
          ...dialogListSync.current
            .slice(index + 1, dialogListSync.current.length)
            .map((item) => ({ ...item, zIndex: 1 })),
        ]);
      }
    }
  };

  // iframe数据通信
  const iframes = useRef<any>([]);
  useEffect(() => {
    iframes.current
      .filter((iframe) => iframe)
      .forEach((iframeInstance) => {
        sendMessageToIframe(iframeInstance, {
          type: "appOpenMethod",
          data: {
            appOpenMethod: appOpenMethod,
          },
        });
      });
  }, [dialogList, appOpenMethod]);
  useEffect(() => {
    iframes.current
      .filter((iframe) => iframe)
      .forEach((iframeInstance) => {
        sendMessageToIframe(iframeInstance, {
          type: "themeChange",
          data: {
            theme: darkMode ? "darkMode" : "default",
          },
        });
      });
  }, [dialogList, darkMode]);
  useEffect(() => {
    const openAppListener = {
      tag: "openApp",
      cb: (res) => {
        if (res.appId === "Navigation") {
          dialogListSync.current.forEach((item) => {
            !item.minimize &&
              macOsDockRef.current.handleAppClick(item.id, true, true);
          });
          return;
        }
        res.appId && macOsDockRef.current.handleAppClick(res.appId, true, true);
      },
    };
    const loginSuccessListener = {
      tag: "loginSuccess",
      cb: (res) => {
        res.token && localStorage.setItem("token", res.token);
      },
    };
    const loginExpireListener = {
      tag: "loginExpire",
      cb: () => {
        localStorage.setItem("token", "");
      },
    };
    const handshakeListener = {
      tag: "handshake",
      cb: (res) => {
        if (res.count === 3) {
          const index = dialogListSync.current.findIndex((item) => {
            return res.clientId.startsWith(item.id);
          });
          setDialogList([
            ...dialogListSync.current.slice(0, index),
            {
              ...dialogListSync.current[index],
              loading: false,
            },
            ...dialogListSync.current.slice(index + 1),
          ]);
          iframes.current
            .filter((iframe) => iframe)
            .forEach((iframeInstance) => {
              sendMessageToIframe(iframeInstance, {
                type: "appOpenMethod",
                data: {
                  appOpenMethod: appOpenMethod,
                },
              });
            });
        }
      },
    };
    iframeCommunicationListener.push(openAppListener);
    iframeCommunicationListener.push(loginSuccessListener);
    iframeCommunicationListener.push(loginExpireListener);
    iframeCommunicationListener.push(handshakeListener);
    return () => {
      iframeCommunicationListener.splice(
        iframeCommunicationListener.findIndex(
          (listener) => listener === openAppListener
        ),
        1
      );
      iframeCommunicationListener.splice(
        iframeCommunicationListener.findIndex(
          (listener) => listener === loginSuccessListener
        ),
        1
      );
      iframeCommunicationListener.splice(
        iframeCommunicationListener.findIndex(
          (listener) => listener === loginExpireListener
        ),
        1
      );
      iframeCommunicationListener.splice(
        iframeCommunicationListener.findIndex(
          (listener) => listener === handshakeListener
        ),
        1
      );
    };
  }, [appOpenMethod]);

  useEffect(() => {
    if (background) {
      const imgs = document.querySelectorAll("img");
      const promises = Array.from(imgs).map((img) => {
        let _resolve;
        const promise = new Promise((resolve) => {
          _resolve = resolve;
        });
        if (img.complete) {
          _resolve(1);
        } else {
          img.onload = () => {
            _resolve(1);
          };
          img.onerror = () => {
            _resolve(1);
          };
        }
        return promise;
      });
      Promise.all(promises).then(() => {
        setGlobalLoading(false);
      });
    }
  }, [background]);

  // 中部小部件
  const musicPlayerContainerRef = useRef(null);
  const cyptoMarketContainerRef = useRef(null);
  const [currentUnitIndex, _setCurrentUnitIndex] = useState(0);
  const currentUnitIndexSync = useRef(currentUnitIndex);
  const setCurrentUnitIndex = (value) => {
    currentUnitIndexSync.current = value;
    _setCurrentUnitIndex(value);
  };
  const verticalUnitContainerRef = useRef(null);
  const draggableRef = useRef([]);
  const { contextSafe } = useGSAP({ scope: verticalUnitContainerRef.current });
  const handleUnitToggleDotClick = contextSafe((index) => {
    setCurrentUnitIndex(index);
    gsap.to(verticalUnitContainerRef.current, {
      x: -innerWidth * index,
      ease: "power2.out",
    });
  });
  const [verticalUnit, setVerticalUnit] = useState(false);
  useEffect(() => {
    if (musicList.length === 0) return;
    const createDraggable = () => {
      draggableRef.current.forEach((draggableInst) => draggableInst.kill());
      draggableRef.current = Draggable.create(
        verticalUnitContainerRef.current,
        {
          type: "x",
          bounds: {
            minX: -innerWidth,
            maxX: 0,
          },
          inertia: true,
          snap: {
            x: Array.from({ length: 2 }).map((_, index) => -index * innerWidth),
          },
          edgeResistance: 0.8,
          dragResistance: 0.3,
          onThrowComplete() {
            setCurrentUnitIndex(-this.x / innerWidth);
          },
        }
      );
      handleUnitToggleDotClick(currentUnitIndexSync.current);
    };
    createDraggable();
    window.addEventListener("resize", createDraggable);
    return () => {
      window.removeEventListener("resize", createDraggable);
      draggableRef.current.forEach((draggableInst) => draggableInst.kill());
    };
  }, [musicList, verticalUnit]);

  useEffect(() => {
    const resizeCb = () => {
      innerWidth > 1024 ? setVerticalUnit(false) : setVerticalUnit(true);
    };
    resizeCb();
    window.addEventListener("resize", resizeCb);
    return () => {
      window.removeEventListener("resize", resizeCb);
    };
  }, []);

  return (
    <div className="w-dvw h-dvh relative select-none">
      {globalLoading && (
        <div className="absolute inset-0 z-[calc(var(--maxZIndex)+1)]">
          <Loading></Loading>
        </div>
      )}
      {!globalLoading && (
        <div className="absolute right-[8vmin] bottom-[6vmin]">
          <Settiing showSetting={!globalLoading}></Settiing>
        </div>
      )}
      {background && (
        <>
          <img
            className="object-cover absolute inset-0 w-full h-full overflow-hidden -z-2"
            src={`${background}`}
          ></img>
          <div className="absolute inset-0 w-full h-full overflow-hidden -z-1 bg-black/20"></div>
        </>
      )}
      <div
        className="w-full h-full overflow-hidden flex justify-between items-center flex-col px-[6vmin] p-[2vmin] gap-[4vmin]"
        ref={dialogContainerRef}
      >
        {timeInfo.default && (
          <div className="select-none flex flex-col items-center text-shadow-lg gap-[1vmin] mt-[10vmin]">
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
        {musicList.length !== 0 && (
          <>
            {verticalUnit ? (
              <div className="w-full relative z-0 [@media(min-aspect-ratio:4/1)]:hidden [@media(max-height:540px)]:hidden">
                <div
                  key={"verticalCyptoContainer"}
                  ref={verticalUnitContainerRef}
                  className="w-full h-full flex justify-start items-center gap-[12vmin] cursor-grab"
                >
                  <div className="w-full shrink-0">
                    <MusicPlayer
                      musicList={musicList}
                      draggable={false}
                    ></MusicPlayer>
                  </div>
                  <div className="w-full h-full shrink-0 relative">
                    <div className="absolute inset-0">
                      <TiltCard draggable={false} tiltable={false}>
                        <StatsCardWithData></StatsCardWithData>
                      </TiltCard>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-[-2.4vmax] left-1/2 -translate-x-1/2 flex gap-[0.8vmax]">
                  {Array.from({ length: 2 }).map((_, dotIndex) => (
                    <div
                      key={dotIndex}
                      className={`w-[0.8vmax] h-[0.8vmax] transition-all duration-500 rounded-full ${
                        currentUnitIndex === dotIndex
                          ? "bg-white"
                          : "bg-gray-400"
                      } cursor-pointer`}
                      onClick={() => handleUnitToggleDotClick(dotIndex)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full gap-[6vmin] flex justify-center items-center relative z-0 [@media(min-aspect-ratio:4/1)]:hidden [@media(max-height:320px)]:hidden">
                <div
                  ref={cyptoMarketContainerRef}
                  key={"horizontalCyptoContainer"}
                  onPointerDown={() => {
                    cyptoMarketContainerRef.current.style.zIndex = 1;
                    musicPlayerContainerRef.current.style.zIndex = 0;
                  }}
                  className="flex-1 relative h-full shrink-0"
                >
                  <div className="absolute inset-0">
                    <TiltCard>
                      <StatsCardWithData></StatsCardWithData>
                    </TiltCard>
                  </div>
                </div>
                <div
                  ref={musicPlayerContainerRef}
                  onPointerDown={() => {
                    musicPlayerContainerRef.current.style.zIndex = 1;
                    cyptoMarketContainerRef.current.style.zIndex = 0;
                  }}
                  className="flex-1 shrink-0"
                >
                  <MusicPlayer musicList={musicList}></MusicPlayer>
                </div>
              </div>
            )}
          </>
        )}

        <div className="dialogBottomBoundary flex flex-col justify-center items-center gap-[2vmin] select-none z-[calc(var(--maxZIndex))]">
          <MacOSDock
            initApps={initApps}
            onAppClick={onAppClick}
            ref={macOsDockRef}
          />
          <div className="text-center">
            <p className="text-[1.5vmin] text-white">
              © 2026 Unstoppable840. All rights reserved.
            </p>
          </div>
        </div>
        <div
          ref={dialogRootContainerRef}
          className="absolute inset-0 pointer-events-none"
        >
          {dialogList.map((item, index) => (
            <SafariDialog
              defaultOpen={item.open}
              defaultMinimize={item.minimize}
              handleHeaderMouseDownCb={() => {
                const index = dialogListSync.current.findIndex(
                  (_item) => _item.id === item.id
                );
                setDialogList([
                  ...dialogListSync.current
                    .slice(0, index)
                    .map((item) => ({ ...item, zIndex: 1 })),
                  { ...dialogListSync.current[index], zIndex: 2 },
                  ...dialogListSync.current
                    .slice(index + 1, dialogListSync.current.length)
                    .map((item) => ({ ...item, zIndex: 1 })),
                ]);
              }}
              handleOpenChange={() => {
                macOsDockRef.current.handleAppClick(item.id, false);
                deleteIframe(`${item.id}_iframe`);
              }}
              handleMinimizeChange={(minimizeStatus) => {
                const index = dialogListSync.current.findIndex(
                  (_item) => _item.id === item.id
                );
                setDialogList([
                  ...dialogListSync.current.slice(0, index),
                  {
                    ...dialogListSync.current[index],
                    minimize: minimizeStatus,
                  },
                  ...dialogListSync.current.slice(
                    index + 1,
                    dialogListSync.current.length
                  ),
                ]);
                macOsDockRef.current.handleAppClick(item.id);
              }}
              zIndex={item.zIndex}
              key={item.id}
              title={item.name}
              minimizeTargetSelector={item.minimizeTargetSelector}
              onClose={() => {
                setDialogList(
                  dialogList.filter((_item) => _item.id !== item.id)
                );
              }}
            >
              {item.loading && (
                <div className="absolute z-10 inset-0">
                  <Loading></Loading>
                </div>
              )}
              <iframe
                className="w-full h-full"
                id={`${item.id}_iframe`}
                src={`${item.url}/?token=${localStorage.getItem("token")}`}
                ref={(el: any) => (iframes.current[index] = el)}
              ></iframe>
            </SafariDialog>
          ))}
        </div>
      </div>
    </div>
  );
}
