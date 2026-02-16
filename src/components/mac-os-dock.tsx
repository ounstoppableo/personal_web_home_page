"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { LiquidGlassCard } from "./liquid-notification";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable, InertiaPlugin } from "gsap/all";
gsap.registerPlugin(Draggable);
gsap.registerPlugin(InertiaPlugin);
// Types for the component
interface DockApp {
  id: string;
  name: string;
  icon: string;
}

interface MacOSDockProps {
  initApps: DockApp[];
  onAppClick: (appId: string) => void;
  className?: string;
  folder?: boolean;
}

const MacOSDock: React.FC<MacOSDockProps> = ({
  initApps,
  onAppClick,
  className = "",
  folder = true,
}) => {
  const [apps] = useState<DockApp[]>(
    folder
      ? [...initApps.slice(0, 5), { id: "folder", name: "Folder", icon: "" }]
      : initApps,
  );
  const [openApps, _setOpenApps] = useState<string[]>([]);
  const openAppsRef = useRef<string[]>(openApps);
  const setOpenApps = (appIds: any) => {
    openAppsRef.current = appIds(openAppsRef.current);
    _setOpenApps(appIds);
  };
  const [folderApps] = useState<DockApp[]>(folder ? initApps.slice(5) : []);
  const mouseXSync = useRef<number | null>(null);
  const setMouseX = (value: number) => {
    mouseXSync.current = value;
  };
  const [currentScales, setCurrentScales] = useState<number[]>(
    apps.map(() => 1),
  );
  const [currentPositions, setCurrentPositions] = useState<number[]>([]);
  const dockRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastMouseMoveTime = useRef<number>(0);

  const _handleAppClick = (appId: string) => {
    setOpenApps((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId],
    );
  };

  // Responsive size calculations based on viewport
  const getResponsiveConfig = useCallback(() => {
    if (typeof window === "undefined") {
      return { baseIconSize: 64, maxScale: 1.6, effectWidth: 240 };
    }

    // Base calculations on smaller dimension for better mobile experience
    const smallerDimension = Math.min(window.innerWidth, window.innerHeight);

    // Scale icon size based on screen size
    if (smallerDimension < 480) {
      // Mobile phones
      return {
        baseIconSize: Math.max(40, smallerDimension * 0.08),
        maxScale: 1.4,
        effectWidth: smallerDimension * 0.4,
      };
    } else if (smallerDimension < 768) {
      // Tablets
      return {
        baseIconSize: Math.max(48, smallerDimension * 0.07),
        maxScale: 1.5,
        effectWidth: smallerDimension * 0.35,
      };
    } else if (smallerDimension < 1024) {
      // Small laptops
      return {
        baseIconSize: Math.max(56, smallerDimension * 0.06),
        maxScale: 1.6,
        effectWidth: smallerDimension * 0.3,
      };
    } else {
      // Desktop and large screens
      return {
        baseIconSize: Math.max(64, Math.min(80, smallerDimension * 0.05)),
        maxScale: 1.8,
        effectWidth: 300,
      };
    }
  }, []);

  const [config, setConfig] = useState(getResponsiveConfig());
  const { baseIconSize, maxScale, effectWidth } = config;
  const minScale = 1.0;
  const baseSpacing = Math.max(4, baseIconSize * 0.08);

  // Authentic macOS cosine-based magnification algorithm
  const calculateTargetMagnification = useCallback(
    (mousePosition: number | null) => {
      if (mousePosition === null) {
        return apps.map(() => minScale);
      }

      return apps.map((_, index) => {
        const normalIconCenter =
          index * (baseIconSize + baseSpacing) + baseIconSize / 2;
        const minX = mousePosition - effectWidth / 2;
        const maxX = mousePosition + effectWidth / 2;

        if (normalIconCenter < minX || normalIconCenter > maxX) {
          return minScale;
        }

        const theta = ((normalIconCenter - minX) / effectWidth) * 2 * Math.PI;
        const cappedTheta = Math.min(Math.max(theta, 0), 2 * Math.PI);
        const scaleFactor = (1 - Math.cos(cappedTheta)) / 2;

        return minScale + scaleFactor * (maxScale - minScale);
      });
    },
    [apps, baseIconSize, baseSpacing, effectWidth, maxScale, minScale],
  );

  // Calculate positions based on current scales
  const calculatePositions = useCallback(
    (scales: number[]) => {
      let currentX = 0;

      return scales.map((scale) => {
        const scaledWidth = baseIconSize * scale;
        const centerX = currentX + scaledWidth / 2;
        currentX += scaledWidth + baseSpacing;
        return centerX;
      });
    },
    [baseIconSize, baseSpacing],
  );

  // Initialize positions
  useEffect(() => {
    const initialScales = apps.map(() => minScale);
    const initialPositions = calculatePositions(initialScales);
    setCurrentScales(initialScales);
    setCurrentPositions(initialPositions);
  }, [apps, calculatePositions, minScale, config]);

  const createBounceAnimation = (element: HTMLElement) => {
    const bounceHeight = Math.max(-8, -baseIconSize * 0.15);
    element.style.transition = "transform 0.2s ease-out";
    element.style.transform = `translateY(${bounceHeight}px)`;

    setTimeout(() => {
      element.style.transform = "translateY(0px)";
    }, 200);
  };

  // Animation loop
  const animateToTarget = useCallback(() => {
    const targetScales = calculateTargetMagnification(mouseXSync.current);
    const targetPositions = calculatePositions(targetScales);
    const lerpFactor = mouseXSync.current !== null ? 0.2 : 0.12;

    setCurrentScales((prevScales) => {
      return prevScales.map((currentScale, index) => {
        const diff = targetScales[index] - currentScale;
        return currentScale + diff * lerpFactor;
      });
    });

    setCurrentPositions((prevPositions) => {
      return prevPositions.map((currentPos, index) => {
        const diff = targetPositions[index] - currentPos;
        return currentPos + diff * lerpFactor;
      });
    });

    const scalesNeedUpdate = currentScales.some(
      (scale, index) => Math.abs(scale - targetScales[index]) > 0.002,
    );
    const positionsNeedUpdate = currentPositions.some(
      (pos, index) => Math.abs(pos - targetPositions[index]) > 0.1,
    );

    if (
      scalesNeedUpdate ||
      positionsNeedUpdate ||
      mouseXSync.current !== null
    ) {
      animationFrameRef.current = requestAnimationFrame(animateToTarget);
    }
  }, [
    calculateTargetMagnification,
    calculatePositions,
    currentScales,
    currentPositions,
  ]);

  // Start/stop animation loop
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animateToTarget);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animateToTarget]);

  const dockeRect = useRef<any>({});
  useEffect(() => {
    dockeRect.current = dockRef.current.getBoundingClientRect();
  }, []);

  // Throttled mouse movement handler
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const isNonPC = !window.matchMedia("(hover: hover)").matches;
      if (isNonPC) return;
      const now = performance.now();

      if (now - lastMouseMoveTime.current < 16) {
        return;
      }

      lastMouseMoveTime.current = now;

      if (dockRef.current) {
        const padding = Math.max(8, baseIconSize * 0.12);
        setMouseX(e.clientX - dockeRect.current.left - padding);
      }
    },
    [baseIconSize],
  );

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  const handleAppClick = (appId: string, index: number) => {
    if (iconRefs.current[index]) {
      createBounceAnimation(iconRefs.current[index]!);
    }
    _handleAppClick(appId);
    if (appId !== "folder") {
      onAppClick(appId);
    }
  };
  const appContainerRef = useRef<HTMLDivElement>(null);
  const appContainerFixedAnchorRef = useRef<HTMLDivElement>(null);
  const [folderContainerPosition, setFolderContainerPosition] = useState<{
    x: number;
    y: number;
  } | null>({ x: 0, y: 0 });
  const { contextSafe: contextSafeForFolderContainer } = useGSAP({
    scope: appContainerRef.current,
  });
  const updateAppContainerPosition = () => {
    requestAnimationFrame(() => {
      const appContainerRect =
        appContainerFixedAnchorRef.current.getBoundingClientRect();
      if (appContainerRect.width + appContainerRect.left > innerWidth) {
        setFolderContainerPosition({
          x: innerWidth - appContainerRect.width - 8,
          y: appContainerRect.top,
        });
      } else {
        setFolderContainerPosition({
          x: appContainerRect.left,
          y: appContainerRect.top,
        });
      }
    });
  };

  const draggableRef = useRef<any>([]);
  const handleFolderClick = contextSafeForFolderContainer(() => {
    draggableRef.current.forEach((draggableInst) => draggableInst.kill());
    if (openAppsRef.current.includes("folder")) {
      setCurrentFolderPage(0);
      gsap.set(draggableContainer.current, {
        x: 0,
      });
      gsap.fromTo(
        appContainerRef.current,
        { scale: 1, opacity: 1 },
        {
          scale: 0,
          opacity: 0,
          duration: 0.4,
        },
      );
    } else {
      updateAppContainerPosition();
      gsap.fromTo(
        appContainerRef.current,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          onComplete: () => {
            gsap.fromTo(
              appContainerRef.current.querySelector(".blurContainer"),
              { backdropFilter: "blur(0px)" },
              {
                backdropFilter: "blur(10px)",
                duration: 0.4,
              },
            );
            const appContainerRect =
              appContainerRef.current.getBoundingClientRect();

            draggableRef.current = Draggable.create(
              draggableContainer.current,
              {
                type: "x",
                bounds: {
                  minX: -(folderPageCount - 1) * appContainerRect.width,
                  maxX: 0,
                },
                inertia: true,
                snap: {
                  x: Array.from({ length: folderPageCount }).map(
                    (_, index) => -index * appContainerRect.width,
                  ),
                },
                edgeResistance: 0.8,
                dragResistance: 0.3,
                onThrowComplete() {
                  setCurrentFolderPage(
                    Math.abs(Math.round(this.x / appContainerRect.width)),
                  );
                },
              },
            );
          },
        },
      );
    }
  });
  useEffect(() => {
    return () => {
      draggableRef.current.forEach((draggableInst) => draggableInst.kill());
    };
  }, []);

  // Calculate content width
  const contentWidth =
    currentPositions.length > 0
      ? Math.max(
          ...currentPositions.map(
            (pos, index) => pos + (baseIconSize * currentScales[index]) / 2,
          ),
        )
      : apps.length * (baseIconSize + baseSpacing) - baseSpacing;
  const padding = Math.max(8, baseIconSize * 0.12);

  const [folderPageCount, setFolderPageCount] = useState<number>(0);
  const [currentFolderPage, _setCurrentFolderPage] = useState<number>(0);
  const currentFolderPageSync = useRef<number>(currentFolderPage);
  const setCurrentFolderPage = (page: number) => {
    _setCurrentFolderPage(page);
    currentFolderPageSync.current = page;
  };
  useEffect(() => {
    setFolderPageCount(
      Math.ceil(folderApps.filter((app) => app.id !== "folder").length / 9),
    );
  }, [folderApps]);
  const draggableContainer = useRef<HTMLDivElement>(null);
  const pageContainer = useRef<HTMLDivElement>(null);

  const { contextSafe: contextSafeForPageContainer } = useGSAP({
    scope: draggableContainer.current,
  });
  const handlePageChange = contextSafeForPageContainer((pageIndex: number) => {
    setCurrentFolderPage(pageIndex);
    const rect = pageContainer.current.getBoundingClientRect();
    gsap.to(draggableContainer.current, {
      x: -pageIndex * rect.width,
      duration: 0.5,
      ease: "power2.out",
    });
  });

  // Update config on window resize
  useEffect(() => {
    const handleResize = () => {
      if (openAppsRef.current.includes("folder")) {
        handleFolderClick();
        _handleAppClick("folder");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getResponsiveConfig, handleFolderClick, _handleAppClick]);

  useEffect(() => {
    let flag = false;
    const mouseupCb = () => {
      if (flag && openAppsRef.current.includes("folder")) {
        handleFolderClick();
        _handleAppClick("folder");
      }
      flag = false;
    };
    const mousedownCb = (e: any) => {
      if (!e.target.closest(".appContainer")) {
        flag = true;
      }
    };
    window.addEventListener("mousedown", mousedownCb);
    window.addEventListener("mouseup", mouseupCb);
    return () => {
      window.removeEventListener("mousedown", mousedownCb);
      window.removeEventListener("mouseup", mouseupCb);
    };
  }, []);
  return (
    <>
      <div
        ref={dockRef}
        className={`backdrop-blur-md ${className}`}
        style={{
          width: `${contentWidth + padding * 2}px`,
          borderRadius: `${Math.max(12, baseIconSize * 0.4)}px`,
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: `
          0 ${Math.max(4, baseIconSize * 0.1)}px ${Math.max(16, baseIconSize * 0.4)}px rgba(0, 0, 0, 0.4),
          0 ${Math.max(2, baseIconSize * 0.05)}px ${Math.max(8, baseIconSize * 0.2)}px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.15),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2)
        `,
          padding: `${padding}px`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative"
          style={{
            height: `${baseIconSize}px`,
            width: "100%",
          }}
        >
          {apps.map((app, index) => {
            const scale = currentScales[index];
            const position = currentPositions[index] || 0;
            const scaledSize = baseIconSize * scale;

            return (
              <div
                key={app.id}
                ref={(el) => {
                  iconRefs.current[index] = el;
                }}
                className="absolute cursor-pointer flex flex-col items-center justify-end"
                title={app.name}
                onClick={() => handleAppClick(app.id, index)}
                style={{
                  left: `${position - scaledSize / 2}px`,
                  bottom: "0px",
                  width: `${scaledSize}px`,
                  height: `${scaledSize}px`,
                  transformOrigin: "bottom center",
                  zIndex: Math.round(scale * 10),
                }}
              >
                {app.id === "folder" ? (
                  <div
                    className="w-full h-full p-[9.25%]"
                    style={{
                      filter: `drop-shadow(0 ${scale > 1.2 ? Math.max(2, baseIconSize * 0.05) : Math.max(1, baseIconSize * 0.03)}px ${scale > 1.2 ? Math.max(4, baseIconSize * 0.1) : Math.max(2, baseIconSize * 0.06)}px rgba(0,0,0,${0.2 + (scale - 1) * 0.15}))`,
                    }}
                    onClick={handleFolderClick}
                  >
                    <div
                      ref={appContainerFixedAnchorRef}
                      className="absolute w-[40vmin] h-[40vmin] origin-[50%_100%] pointer-events-none top-0 left-1/2 -translate-x-1/2 -translate-y-full"
                    ></div>
                    {createPortal(
                      <div
                        ref={appContainerRef}
                        className="appContainer absolute w-[40vmin] h-[40vmin] origin-[50%_100%] opacity-0 scale-0"
                        style={{
                          top: folderContainerPosition.y + "px",
                          left: folderContainerPosition.x + "px",
                        }}
                        onMouseMove={(e) => e.stopPropagation()}
                        onMouseEnter={handleMouseLeave}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LiquidGlassCard
                          shadowIntensity="md"
                          blurIntensity="lg"
                          borderRadius="20%"
                          glowIntensity="xl"
                          draggable={false}
                          className="z-10 flex items-start relative overflow-hidden cursor-default"
                        >
                          <div
                            className="h-full w-full flex flex-col select-none relative z-10"
                            ref={pageContainer}
                          >
                            {folderApps.length === 0 ? (
                              <div className="text-[3vmin] leading-[3vmin] w-full h-full flex justify-center items-center text-muted">
                                暂无数据
                              </div>
                            ) : (
                              <div
                                className="h-full flex flex-1"
                                style={{
                                  width: `${folderPageCount * 100}%`,
                                }}
                                ref={draggableContainer}
                              >
                                {Array.from({
                                  length: folderPageCount,
                                }).map((_, pageIndex) => {
                                  return (
                                    <div
                                      key={pageIndex}
                                      className="w-full h-full grid grid-cols-3 grid-rows-3 gap-[1vmin] p-[3vmin] pb-[4vmin]"
                                    >
                                      {folderApps
                                        .filter((app) => app.id !== "folder")
                                        .slice(
                                          pageIndex * 9,
                                          (pageIndex + 1) * 9,
                                        )
                                        .map((app) => {
                                          return (
                                            <div
                                              key={app.id}
                                              className="cursor-pointer group hover:scale-110 transition-transform duration-200 flex flex-col justify-center items-center overflow-hidden"
                                            >
                                              <img
                                                src={app.icon}
                                                alt={app.name}
                                                className="group-hover:brightness-80 transition-all duration-200 object-contain h-[calc(100%-2vmin)]"
                                              />
                                              <div className="text-white text-[2vmin] leading-[2vmin] w-full text-center truncate">
                                                {app.name}
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          {folderPageCount > 1 && (
                            <div className="absolute bottom-[1.8vmin] left-1/2 -translate-x-1/2 flex gap-[1vmin] z-20">
                              {Array.from({ length: folderPageCount }).map(
                                (_, dotIndex) => (
                                  <div
                                    key={dotIndex}
                                    className={`w-[1vmin] h-[1vmin] transition-all duration-500 rounded-full ${
                                      currentFolderPage === dotIndex
                                        ? "bg-white"
                                        : "bg-gray-400"
                                    } cursor-pointer`}
                                    onClick={() => handlePageChange(dotIndex)}
                                  />
                                ),
                              )}
                            </div>
                          )}
                        </LiquidGlassCard>
                      </div>,
                      document.body,
                    )}

                    <LiquidGlassCard
                      shadowIntensity="md"
                      blurIntensity="lg"
                      borderRadius="20%"
                      glowIntensity="xl"
                      draggable={false}
                      className="z-10 flex items-start relative overflow-hidden"
                    >
                      <div className="w-full h-full grid grid-cols-3 p-[1vmin] gap-[.25vmin]">
                        {folderApps
                          .filter((app) => app.id !== "folder")
                          .slice(0, 9)
                          .map((app) => {
                            return (
                              <img
                                key={app.id}
                                src={app.icon}
                                alt={app.name}
                                className="object-contain"
                                style={{
                                  filter: `drop-shadow(0 ${scale > 1.2 ? Math.max(2, baseIconSize * 0.05) : Math.max(1, baseIconSize * 0.03)}px ${scale > 1.2 ? Math.max(4, baseIconSize * 0.1) : Math.max(2, baseIconSize * 0.06)}px rgba(0,0,0,${0.2 + (scale - 1) * 0.15}))`,
                                }}
                              />
                            );
                          })}
                      </div>
                    </LiquidGlassCard>
                  </div>
                ) : (
                  <img
                    src={app.icon}
                    alt={app.name}
                    width={scaledSize}
                    height={scaledSize}
                    className="object-contain"
                    style={{
                      filter: `drop-shadow(0 ${scale > 1.2 ? Math.max(2, baseIconSize * 0.05) : Math.max(1, baseIconSize * 0.03)}px ${scale > 1.2 ? Math.max(4, baseIconSize * 0.1) : Math.max(2, baseIconSize * 0.06)}px rgba(0,0,0,${0.2 + (scale - 1) * 0.15}))`,
                    }}
                  />
                )}

                {/* App Indicator Dot */}
                {openApps.includes(app.id) && (
                  <div
                    className="absolute"
                    style={{
                      bottom: `${Math.max(-2, -baseIconSize * 0.05)}px`,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: `${Math.max(3, baseIconSize * 0.06)}px`,
                      height: `${Math.max(3, baseIconSize * 0.06)}px`,
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      boxShadow: "0 0 4px rgba(0, 0, 0, 0.3)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MacOSDock;
