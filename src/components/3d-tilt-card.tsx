"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

export default function Card3D({ draggable = true, children }) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 更丝滑
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), {
    stiffness: 200,
    damping: 20,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current!.getBoundingClientRect();

    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    // 归一化到 -0.5 ~ 0.5
    x.set(px - 0.5);
    y.set(py - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const motionProps = draggable
    ? {
        drag: draggable,
        dragConstraints: draggable
          ? { left: 0, right: 0, top: 0, bottom: 0 }
          : undefined,
        dragElastic: draggable ? 0.3 : undefined,
        dragTransition: draggable
          ? {
              bounceStiffness: 300,
              bounceDamping: 10,
              power: 0.3,
            }
          : undefined,
        whileDrag: draggable ? { scale: 1.02 } : undefined,
        whileHover: { scale: 1.01 },
        whileTap: { scale: 0.98 },
      }
    : {};

  return (
    <motion.div
      style={{
        perspective: 1000,
      }}
      {...motionProps}
      className="w-full h-full cursor-grab"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
        }}
        whileHover={{ scale: 1.02 }}
        className="w-ful h-full rounded-[2rem] shadow-2xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
