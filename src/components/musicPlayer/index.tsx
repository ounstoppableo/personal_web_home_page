import { useCallback, useEffect, useRef, useState } from "react";
import { LiquidGlassCard } from "../liquid-notification";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Button } from "../ui/button";
import { FaPlay, FaPause } from "react-icons/fa";
import { IoPlayBack, IoPlayForward } from "react-icons/io5";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
dayjs.extend(duration);

function parseLRC(text) {
  const result = [];

  // 匹配：[时间] + 后面的歌词（直到下一个时间或结尾）
  const regex = /\[(\d{2}:\d{2}(?:(?:[:.])\d{2,3})?)\]([^\[]*)/g;

  let match;

  while ((match = regex.exec(text)) !== null) {
    let [, time, lyric] = match;

    // 统一 00:04:15 → 00:04.15
    if (time.split(":").length === 3) {
      const [m, s, ms] = time.split(":");
      time = `${m}:${s}.${ms}`;
    }

    result.push({
      time,
      seconds: toSeconds(time),
      lyric: lyric.trim(),
    });
  }

  return result;
}

function toSeconds(time) {
  const [m, rest] = time.split(":");
  const [s, ms = "0"] = rest.split(".");
  return Number(m) * 60 + Number(s) + Number(ms) / Math.pow(10, ms.length);
}

export default function MusicPlayer(props: any) {
  const { musicList } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const lyricList = useRef([]);
  const [currentLyric, setCurrentLyric] = useState<any>("");
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    console.log(musicList);
  }, [musicList]);
  function format(seconds) {
    const d = dayjs.duration(seconds, "seconds");
    const mm = String(d.minutes()).padStart(2, "0");
    const ss = String(d.seconds()).padStart(2, "0");

    return `${mm}:${ss}`;
  }
  const [currentTime, setCurrentTime] = useState(0);
  const playingCb = useCallback(() => {
    setCurrentTime(audioRef.current.currentTime);
    lyricList.current.length !== 0 &&
      setCurrentLyric(
        lyricList.current[
          lyricList.current.findIndex(
            (item) => item.seconds > audioRef.current.currentTime
          ) - 1
        ].lyric
      );

    !processMove.current &&
      xTo.current(audioRef.current.currentTime / currentDuration);
  }, [playing, musicList, currentIndex, currentDuration]);
  const endedCb = useCallback(() => {
    setPlaying(false);
  }, [playing, musicList, currentIndex, currentDuration]);
  const loadedMetaDataCb = useCallback(() => {
    setCurrentDuration(audioRef.current.duration);
  }, [playing, musicList, currentIndex, currentDuration]);
  const handlePlay = () => {
    setPlaying(!playing);
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };
  useEffect(() => {
    audioRef.current?.addEventListener("ended", endedCb);
    if (playing) {
      audioRef.current?.addEventListener("timeupdate", playingCb);
    }
    audioRef.current?.addEventListener("loadedmetadata", loadedMetaDataCb);
    return () => {
      audioRef.current?.removeEventListener("timeupdate", playingCb);
      audioRef.current?.removeEventListener("ended", endedCb);
      audioRef.current?.removeEventListener("loadedmetadata", loadedMetaDataCb);
    };
  }, [playing, musicList, currentIndex, currentDuration]);

  // 进度条控制
  const processMove = useRef(false);
  const pointerDownInfo = useRef<any>({
    x: 0,
    time: 0,
    scale: 0,
    finalTime: 0,
    finalScale: 0,
  });
  const processRef = useRef(null);
  const currentTimeProcessRef = useRef(null);
  const processRectRef = useRef<any>({});
  const xTo = useRef<any>(() => {});
  useEffect(() => {
    xTo.current = gsap.quickTo(currentTimeProcessRef.current, "scaleX", {
      duration: 0.1,
    });
  }, [playing, musicList, currentIndex, currentDuration]);

  const prev = useCallback(() => {
    xTo.current(0);
    setCurrentIndex((musicList.length + currentIndex - 1) % musicList.length);
  }, [playing, musicList, currentIndex, currentDuration]);
  const next = useCallback(() => {
    xTo.current(0);
    setCurrentIndex((currentIndex + 1) % musicList.length);
  }, [playing, musicList, currentIndex, currentDuration]);
  useEffect(() => {
    if (playing) {
      audioRef.current.play();
    }
    if (musicList[currentIndex]?.lyric) {
      lyricList.current = parseLRC(musicList[currentIndex].lyric);
    } else {
      lyricList.current = [];
      setCurrentLyric("");
    }
  }, [playing, musicList, currentIndex, currentDuration]);

  // 音乐信息滚动效果
  const musicInfoContainerRef = useRef(null);
  const musicNameRef = useRef(null);
  const musicAuthorRef = useRef(null);
  useGSAP(
    () => {
      if (musicNameRef.current) {
        gsap.killTweensOf(musicNameRef.current);
        const rect = musicNameRef.current.getBoundingClientRect();
        const scrollSpace =
          musicNameRef.current.offsetWidth -
          musicInfoContainerRef.current.offsetWidth;
        musicNameRef.current.scrollLeft = 0;
        gsap.fromTo(
          musicNameRef.current,
          {
            x: 0,
          },
          {
            repeat: -1,
            duration: rect.width / 60,
            ease: "linear",
            repeatDelay: 2,
            delay: 2,
            x: -scrollSpace,
          }
        );
        return () => {
          gsap.killTweensOf(musicNameRef.current);
        };
      }
    },
    {
      dependencies: [musicList, currentIndex, currentLyric],
      scope: musicNameRef.current,
    }
  );
  useGSAP(
    () => {
      if (musicAuthorRef.current) {
        gsap.killTweensOf(musicAuthorRef.current);
        const rect = musicAuthorRef.current.getBoundingClientRect();
        const scrollSpace =
          musicAuthorRef.current.offsetWidth -
          musicInfoContainerRef.current.offsetWidth;
        musicAuthorRef.current.scrollLeft = 0;
        gsap.fromTo(
          musicAuthorRef.current,
          {
            x: 0,
          },
          {
            repeat: -1,
            duration: rect.width / 60,
            ease: "linear",
            repeatDelay: 2,
            delay: 2,
            x: -scrollSpace,
          }
        );
        return () => {
          gsap.killTweensOf(musicAuthorRef.current);
        };
      }
    },
    {
      dependencies: [musicList, currentIndex],
      scope: musicAuthorRef.current,
    }
  );

  return (
    <>
      {musicList.length !== 0 && (
        <LiquidGlassCard className="z-0">
          <div className="w-full h-full py-[3vmin] px-[4vmin] flex flex-col gap-[2vmin] text-white">
            <div className="flex gap-[2vmin] items-center">
              <div className="w-[12vmin] h-[12vmin] rounded-lg overflow-hidden">
                <img
                  src={musicList[currentIndex].picUrl}
                  className="w-full h-full object-cover"
                  onDragStart={(e) => e.preventDefault()}
                ></img>
              </div>
              <div
                ref={musicInfoContainerRef}
                className="flex-1 flex flex-col gap-[1vmin] text-[3vmin] leading-[3vmin] whitespace-nowrap overflow-hidden"
              >
                <div className="min-w-full w-fit" ref={musicNameRef}>
                  {playing
                    ? currentLyric
                      ? currentLyric
                      : musicList[currentIndex].musicName
                    : musicList[currentIndex].musicName}
                </div>
                <div
                  className="min-w-full w-fit text-gray-300"
                  ref={musicAuthorRef}
                >
                  {musicList[currentIndex].musicAuthor}
                </div>
              </div>
            </div>
            <div className="w-full flex items-center text-[2.5vmin] leading-[2.5vmin]">
              <div className="text-gray-300 w-[8vmin]">
                {format(currentTime)}
              </div>

              <div
                className="w-full h-[1.5vmin] bg-gray-600/60 rounded-[0.75vmin] relative overflow-hidden cursor-pointer"
                style={{ touchAction: "none" }}
                ref={processRef}
                onPointerDown={(e) => {
                  processMove.current = true;
                  processRectRef.current =
                    processRef.current.getBoundingClientRect();
                  pointerDownInfo.current = {
                    x: e.clientX,
                    time: currentTime,
                    scale: currentTime / currentDuration,
                  };
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  e.stopPropagation();
                  if (processMove.current) {
                    const deltaX = e.clientX - pointerDownInfo.current.x;
                    const _scale =
                      pointerDownInfo.current.scale +
                      deltaX / processRectRef.current.width;
                    const finaltTime =
                      pointerDownInfo.current.time +
                      currentDuration * (deltaX / processRectRef.current.width);
                    pointerDownInfo.current.finalTime =
                      finaltTime < 0
                        ? 0
                        : finaltTime > currentDuration
                        ? currentDuration
                        : finaltTime;
                    pointerDownInfo.current.finalScale =
                      _scale < 0 ? 0 : _scale > 1 ? 1 : _scale;
                    xTo.current(pointerDownInfo.current.finalScale);
                  }
                }}
                onPointerUp={(e) => {
                  processMove.current = false;
                  if (!pointerDownInfo.current.finalTime) {
                    const finaltTime =
                      currentDuration *
                      ((e.clientX - processRectRef.current.x) /
                        processRectRef.current.width);
                    pointerDownInfo.current.finalTime =
                      finaltTime < 0
                        ? 0
                        : finaltTime > currentDuration
                        ? currentDuration
                        : finaltTime;
                  }
                  if (!pointerDownInfo.current.finalScale) {
                    const finalScale =
                      (e.clientX - processRectRef.current.x) /
                      processRectRef.current.width;
                    pointerDownInfo.current.finalScale =
                      finalScale < 0 ? 0 : finalScale > 1 ? 1 : finalScale;
                  }
                  audioRef.current.currentTime =
                    pointerDownInfo.current.finalTime;
                  xTo.current(pointerDownInfo.current.finalScale);
                }}
              >
                <div
                  className="absolute inset-0 bg-white/80 origin-left scale-x-0"
                  ref={currentTimeProcessRef}
                ></div>
              </div>
              <div className="text-gray-300 w-[8vmin] text-right">
                {format(currentDuration)}
              </div>
            </div>
            <div className="w-full flex justify-center items-center gap-[8vmin]">
              <Button
                variant="ghost"
                className="rounded-full w-[8vmin] h-[8vmin] cursor-pointer hover:bg-black/20 flex justify-center items-center"
                onClick={prev}
              >
                <IoPlayBack className="size-[4vmin] text-white" />
              </Button>
              <Button
                variant="ghost"
                className="rounded-full w-[8vmin] h-[8vmin] cursor-pointer hover:bg-black/20 flex justify-center items-center"
                onClick={handlePlay}
              >
                {playing ? (
                  <FaPause className="size-[4vmin] text-white" />
                ) : (
                  <FaPlay className="size-[4vmin] text-white" />
                )}
              </Button>
              <Button
                variant="ghost"
                className="rounded-full w-[8vmin] h-[8vmin] cursor-pointer hover:bg-black/20 flex justify-center items-center"
                onClick={next}
              >
                <IoPlayForward className="size-[4vmin] text-white" />
              </Button>
            </div>
          </div>
          <audio
            src={`/api/music/${musicList[currentIndex].musicUrl}`}
            ref={audioRef}
          ></audio>
        </LiquidGlassCard>
      )}
    </>
  );
}
