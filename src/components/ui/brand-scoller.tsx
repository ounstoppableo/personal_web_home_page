"use client";

import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import {
  BsGoogle,
  BsInstagram,
  BsTiktok,
  BsTwitter,
  BsYoutube,
} from "react-icons/bs";

export const BrandScroller = (props: any) => {
  const { className } = props;
  const [repeatCount, setRepeatCount] = useState(4);
  const container = useRef<any>(null);
  useEffect(() => {
    const cb = () => {
      const itemWidth = Math.min(innerHeight, innerWidth) * 0.16;
      const containerWidth = container.current.offsetWidth;
      setRepeatCount(Math.floor(containerWidth / itemWidth / 4) * 2);
    };
    const resizeObserver = new ResizeObserver(cb);
    resizeObserver.observe(container.current);
    cb();
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  const steps = useRef<any>([]);
  useEffect(() => {
    const tm = gsap.timeline();
    steps.current.forEach((step: any, index: number) => {
      if (!step) return;
      tm.fromTo(
        step,
        { x: 0 },
        {
          x: -step.offsetWidth,
          ease: "linear",
          duration: 10,
          repeat: -1,
        },
        0,
      );
    });
    tm.play();
    return () => {
      tm.kill();
    };
  }, [repeatCount]);
  return (
    <>
      <div
        ref={(el) => {
          container.current = el;
          props.ref.current = el;
        }}
        className={cn(
          "border-4 border-black bg-white group flex overflow-hidden py-2 [--gap:2rem] flex-row max-w-full [mask-image:linear-gradient(to_right,_rgba(0,_0,_0,_0),rgba(0,_0,_0,_1)_10%,rgba(0,_0,_0,_1)_90%,rgba(0,_0,_0,_0))]",
          className,
        )}
      >
        {Array(repeatCount)
          .fill(0)
          .map((_, i) => (
            <div
              className="flex shrink-0 justify-around flex-row dark:text-black"
              key={i + "normal"}
              ref={(el: any) => {
                steps.current[i] = el;
              }}
            >
              <div className="flex items-center w-fit gap-3 mr-[var(--gap)]">
                <BsTiktok size={24} />
                <p className="text-lg font-semibold opacity-80">TikTok</p>
              </div>
              <div className="flex items-center w-fit gap-3 mr-[var(--gap)]">
                <BsYoutube size={24} />
                <p className="text-lg font-semibold opacity-80">YouTube</p>
              </div>
              <div className="flex items-center w-fit gap-3 mr-[var(--gap)]">
                <BsInstagram size={24} />
                <p className="text-lg font-semibold opacity-80">Instagram</p>
              </div>
              <div className="flex items-center w-fit gap-3 mr-[var(--gap)]">
                <BsGoogle size={24} />
                <p className="text-lg font-semibold opacity-80">Google</p>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export const BrandScrollerReverse = (props: any) => {
  const { className } = props;
  const [repeatCount, setRepeatCount] = useState(4);
  const container = useRef<any>(null);
  useEffect(() => {
    const cb = () => {
      const itemWidth = Math.min(innerHeight, innerWidth) * 0.16;
      const containerWidth = container.current.offsetWidth;
      setRepeatCount(Math.floor(containerWidth / itemWidth / 4) * 2);
    };
    const resizeObserver = new ResizeObserver(cb);
    resizeObserver.observe(container.current);
    cb();
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  const steps = useRef<any>([]);
  useEffect(() => {
    const tm = gsap.timeline();
    steps.current.forEach((step: any, index: number) => {
      if (!step) return;
      tm.fromTo(
        step,
        { x: -step.offsetWidth },
        {
          x: 0,
          ease: "linear",
          duration: 10,
          repeat: -1,
        },
        0,
      );
    });
    tm.play();
    return () => {
      tm.kill();
    };
  }, [repeatCount]);
  return (
    <>
      <div
        ref={(el) => {
          container.current = el;
          props.ref.current = el;
        }}
        className={cn(
          "border-4 border-black bg-white group flex overflow-hidden py-2 [--gap:2rem] flex-row max-w-full [--duration:40s] [mask-image:linear-gradient(to_right,_rgba(0,_0,_0,_0),rgba(0,_0,_0,_1)_10%,rgba(0,_0,_0,_1)_90%,rgba(0,_0,_0,_0))]",
          className,
        )}
      >
        {Array(repeatCount)
          .fill(0)
          .map((_, i) => (
            <div
              className="flex shrink-0 justify-around flex-row dark:text-black"
              key={i + "reverse"}
              ref={(el: any) => {
                steps.current[i] = el;
              }}
            >
              <div className="flex items-center w-fit gap-3 mr-[var(--gap)]">
                <BsTiktok size={24} />
                <p className="text-lg font-semibold opacity-80">TikTok</p>
              </div>
              <div className="flex items-center w-fit gap-3 mr-[var(--gap)]">
                <BsYoutube size={24} />
                <p className="text-lg font-semibold opacity-80">YouTube</p>
              </div>
              <div className="flex items-center w-fit gap-3 mr-[var(--gap)]">
                <BsInstagram size={24} />
                <p className="text-lg font-semibold opacity-80">Instagram</p>
              </div>
              <div className="flex items-center w-fit gap-3 mr-[var(--gap)]">
                <BsGoogle size={24} />
                <p className="text-lg font-semibold opacity-80">Google</p>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};
