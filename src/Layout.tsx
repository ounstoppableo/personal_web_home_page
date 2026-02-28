import { useEffect, useRef, useState } from "react";
import "./App.css";
import request from "./utils/fetch";
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
export default function Layout() {
  const [background, setBackground] = useState<string>("");
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
  ];
  const macOsDockRef = useRef(null);
  const appOpenMethod = useSelector(
    (state: any) => state.setting.appOpenMethod
  );
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
    }).then((res: CommonResponse) => {
      if (res.code === codeMap.success) {
        setBackground(res.data[0]?.sourcePath);
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

  const [showSetting] = useState<boolean>(true);
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
      cb: (res) => {
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
  }, []);

  useEffect(() => {
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
  }, []);

  return (
    <div className="w-dvw h-dvh relative select-none">
      {globalLoading && (
        <div className="absolute inset-0 z-[calc(var(--maxZIndex)+1)]">
          <Loading></Loading>
        </div>
      )}
      <div className="absolute right-[8vmin] bottom-[6vmin]">
        <Settiing showSetting={showSetting}></Settiing>
      </div>
      {background && (
        <>
          <img
            className="object-cover absolute inset-0 w-full h-full overflow-hidden -z-2"
            src={`/imageFromMedia${background}`}
          ></img>
          <div className="absolute inset-0 w-full h-full overflow-hidden -z-1 bg-black/20"></div>
        </>
      )}
      <div
        className="w-full h-full overflow-hidden flex justify-between items-center flex-col px-[6vmin] pt-[8vmin] pb-[2vmin]"
        ref={dialogContainerRef}
      >
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
        <div className="dialogBottomBoundary flex flex-col justify-center items-center gap-[2vmin] select-none z-[var(--maxZIndex-1)]">
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
              handleOpenChange={(openStatus) => {
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
