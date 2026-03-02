import { useCallback, useEffect, useRef, useState } from "react";
import { LiquidGlassCard } from "../liquid-notification";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Button } from "../ui/button";
import { FaPlay, FaPause } from "react-icons/fa";
import { IoPlayBack, IoPlayForward } from "react-icons/io5";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FaRandom } from "react-icons/fa";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { motion } from "framer-motion";

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
  const { musicList, draggable } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const lyricList = useRef([]);
  const [currentLyric, setCurrentLyric] = useState<any>("");
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  function format(seconds) {
    const d = dayjs.duration(seconds, "seconds");
    const mm = String(d.minutes()).padStart(2, "0");
    const ss = String(d.seconds()).padStart(2, "0");

    return `${mm}:${ss}`;
  }
  const [currentTime, setCurrentTime] = useState(0);

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

  // 处理歌词
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
      const infoScrollCb = () => {
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
        }
      };
      infoScrollCb();
      window.addEventListener("resize", infoScrollCb);
      return () => {
        gsap.killTweensOf(musicNameRef.current);
        window.removeEventListener("resize", infoScrollCb);
      };
    },
    {
      dependencies: [musicList, currentIndex, currentLyric],
      scope: musicNameRef.current,
    }
  );
  useGSAP(
    () => {
      const infoScrollCb = () => {
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
        }
      };
      infoScrollCb();
      window.addEventListener("resize", infoScrollCb);
      return () => {
        gsap.killTweensOf(musicNameRef.current);
        window.removeEventListener("resize", infoScrollCb);
      };
    },
    {
      dependencies: [musicList, currentIndex],
      scope: musicAuthorRef.current,
    }
  );

  // 音频绘制
  const canvasRef = useRef(null);
  const canvasCtx = useRef(null);
  const analyser = useRef(null);
  const audiaDataArray = useRef(null);
  const animationFrameRef = useRef(null);
  const frequencyCount = useRef(40);
  const initAudioContext = () => {
    if (analyser.current) return;
    const audioCtx = new AudioContext();
    const audioSource = audioCtx.createMediaElementSource(audioRef.current);
    analyser.current = audioCtx.createAnalyser();
    analyser.current.fftSize = 512;
    audiaDataArray.current = new Uint8Array(analyser.current.frequencyBinCount);
    audioSource.connect(analyser.current);
    analyser.current.connect(audioCtx.destination);
  };
  const draw = useCallback(() => {
    if (!canvasRef.current) return;
    if (!canvasCtx.current) return;
    const { width, height } = canvasRef.current;
    const count = frequencyCount.current;
    const mid = (count - 1) / 2;
    const strokeGap = (width / count) * 0.3;
    const strokeWidth = (width - strokeGap * (count - 1)) / count;
    const maxStrokeHeight = (height / 2) * 0.5;

    analyser.current.getByteFrequencyData(audiaDataArray.current);
    if (audiaDataArray.current) {
      canvasCtx.current.clearRect(0, 0, width, height);
      let i = -1;
      const usableBins = Math.floor(analyser.current.frequencyBinCount * 0.6);
      const maxValue = Math.max(...audiaDataArray.current) || 1;
      canvasCtx.current.strokeStyle = "rgba(209, 213, 220, 0.8)";
      canvasCtx.current.lineWidth = strokeWidth;
      while (++i < count) {
        // 中间高效果
        const distance = Math.abs(i - mid) / mid;
        const weight = 1 - distance;
        const dataIndex = Math.floor((i / (count - 1)) * usableBins);
        const normalized = audiaDataArray.current[dataIndex] / maxValue;
        const strokeHeight =
          maxStrokeHeight * normalized * weight + maxStrokeHeight * 0.1;

        // 绘制上半部分
        const x0 = strokeWidth / 2 + i * strokeWidth + i * strokeGap;
        const y0 = height / 2;
        const x1 = strokeWidth / 2 + i * strokeWidth + i * strokeGap;
        const y1 = height / 2 + strokeHeight;

        // 绘制下半部分
        const x2 = strokeWidth / 2 + i * strokeWidth + i * strokeGap;
        const y2 = height / 2;
        const x3 = strokeWidth / 2 + i * strokeWidth + i * strokeGap;
        const y3 = height / 2 - strokeHeight;

        // 绘制直线
        canvasCtx.current.beginPath();
        canvasCtx.current.beginPath();
        canvasCtx.current.moveTo(x0, y0);
        canvasCtx.current.lineTo(x1, y1);
        canvasCtx.current.stroke();
        canvasCtx.current.closePath();

        canvasCtx.current.beginPath();
        canvasCtx.current.moveTo(x2, y2);
        canvasCtx.current.lineTo(x3, y3);
        canvasCtx.current.stroke();
        canvasCtx.current.closePath();
      }
    }
    // eslint-disable-next-line react-hooks/immutability
    animationFrameRef.current = requestAnimationFrame(draw);
  }, []);
  useEffect(() => {
    if (canvasRef.current) {
      canvasCtx.current = canvasRef.current?.getContext("2d");
    }
    const playCb = () => {
      initAudioContext();
      cancelAnimationFrame(animationFrameRef.current);
      draw();
    };
    audioRef.current?.addEventListener("play", playCb);
    const _audioRef = audioRef.current;
    return () => {
      _audioRef?.removeEventListener("play", playCb);
    };
  }, [draw, playing, musicList]);

  const musicContainerRef = useRef(null);
  useEffect(() => {
    const cb = () => {
      if (!musicContainerRef.current) return;
      const width = musicContainerRef.current.offsetWidth;
      if (width > 1680) {
        frequencyCount.current = 30;
      } else if (width > 1440) {
        frequencyCount.current = 26;
      } else if (width > 1280) {
        frequencyCount.current = 22;
      } else if (width > 1024) {
        frequencyCount.current = 18;
      } else if (width > 800) {
        frequencyCount.current = 14;
      } else {
        frequencyCount.current = 10;
      }
    };
    cb();
    window.addEventListener("resize", cb);
    return () => {
      window.removeEventListener("resize", cb);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [musicList]);

  // 控制播放模式
  const [playMode, setPlayMode] = useState<"order" | "random">("order");
  const prev = useCallback(() => {
    xTo.current(0);
    setCurrentIndex((musicList.length + currentIndex - 1) % musicList.length);
  }, [musicList, currentIndex]);
  const next = useCallback(() => {
    xTo.current(0);
    if (playMode === "order") {
      setCurrentIndex((currentIndex + 1) % musicList.length);
    }
    if (playMode === "random") {
      setCurrentIndex(Math.floor(Math.random() * musicList.length));
    }
  }, [musicList, currentIndex, playMode]);
  const endedCb = useCallback(() => {
    next();
  }, [next]);
  useEffect(() => {
    audioRef.current?.addEventListener("ended", endedCb);
    const _audioRef = audioRef.current;
    return () => {
      _audioRef?.removeEventListener("ended", endedCb);
    };
  }, [playing, musicList, currentIndex, currentDuration, playMode, endedCb]);

  // 其他事件监听
  const handlePlay = () => {
    setPlaying(!playing);
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };
  const playingCb = useCallback(() => {
    setCurrentTime(audioRef.current.currentTime);
    lyricList.current.length !== 0 &&
      setCurrentLyric(
        lyricList.current[
          lyricList.current.findIndex(
            (item) => item.seconds > audioRef.current.currentTime
          ) - 1
        ]?.lyric || ""
      );

    !processMove.current &&
      xTo.current(audioRef.current.currentTime / currentDuration);
  }, [currentDuration]);
  const loadedMetaDataCb = useCallback(() => {
    setCurrentDuration(audioRef.current.duration);
  }, []);
  useEffect(() => {
    if (playing) {
      audioRef.current?.addEventListener("timeupdate", playingCb);
    }
    audioRef.current?.addEventListener("loadedmetadata", loadedMetaDataCb);
    const _audioRef = audioRef.current;
    return () => {
      _audioRef?.removeEventListener("timeupdate", playingCb);
      _audioRef?.removeEventListener("loadedmetadata", loadedMetaDataCb);
    };
  }, [
    playing,
    musicList,
    currentIndex,
    currentDuration,
    playMode,
    loadedMetaDataCb,
    playingCb,
  ]);

  return (
    <>
      {musicList.length !== 0 && (
        <LiquidGlassCard draggable={draggable}>
          <div
            ref={musicContainerRef}
            className="w-full h-full py-[4vmin] px-[6vmin] flex flex-col gap-[2vmin] text-white"
          >
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
              <div className="w-1/12 h-[12vmin]">
                <canvas className="w-full h-full" ref={canvasRef}></canvas>
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
                  setCurrentTime(pointerDownInfo.current.finalTime);
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
            <div className="w-full flex justify-center items-center gap-[8vmin] relative">
              <motion.div
                whileTap={{ scale: 0.6 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 18,
                }}
                className="w-fit h-fit"
              >
                <Button
                  variant="ghost"
                  className="rounded-full w-[8vmin] h-[8vmin] cursor-pointer hover:bg-black/20 flex justify-center items-center"
                  onClick={prev}
                >
                  <IoPlayBack className="size-[4vmin] text-white" />
                </Button>
              </motion.div>
              <motion.div
                whileTap={{ scale: 0.6 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 18,
                }}
                className="w-fit h-fit"
              >
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
              </motion.div>
              <motion.div
                whileTap={{ scale: 0.6 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 18,
                }}
                className="w-fit h-fit"
              >
                <Button
                  variant="ghost"
                  className="rounded-full w-[8vmin] h-[8vmin] cursor-pointer hover:bg-black/20 flex justify-center items-center"
                  onClick={next}
                >
                  <IoPlayForward className="size-[4vmin] text-white" />
                </Button>
              </motion.div>

              <div className="absolute right-[-2vmin] top-0">
                <motion.div
                  whileTap={{ scale: 0.6 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 18,
                  }}
                  className="w-fit h-fit"
                >
                  <Button
                    variant="ghost"
                    className="rounded-full w-[8vmin] h-[8vmin] cursor-pointer hover:bg-black/20 flex justify-center items-center"
                    onPointerDown={() => {
                      if (playMode === "order") {
                        setPlayMode("random");
                      }
                      if (playMode === "random") {
                        setPlayMode("order");
                      }
                    }}
                  >
                    {playMode === "order" ? (
                      <FaArrowRightArrowLeft className="size-[4vmin] text-white" />
                    ) : (
                      <FaRandom className="size-[4vmin] text-white" />
                    )}
                  </Button>
                </motion.div>
              </div>
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
