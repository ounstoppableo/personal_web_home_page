import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; // Your utility for merging class names

// --- TYPE DEFINITIONS ---

interface Coin {
  iconUrl: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
}

interface Dominance {
  name: string;
  percentage: number;
  color: string; // e.g., 'bg-blue-500' or a CSS variable
}

interface CryptoStatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  marketCapUSD: number;
  marketCapChange: number;
  chartData: number[];
  dominanceData: Dominance[];
  coinData: Coin[];
  currencySymbol?: string;
}

// --- HELPER FUNCTIONS ---

const formatMarketCap = (num: number): string => {
  if (num >= 1e12) {
    return `${(num / 1e12).toFixed(2)}T`;
  }
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B`;
  }
  return num.toString();
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

// --- SUB-COMPONENTS ---

/**
 * An animated SVG sparkline chart component.
 * Uses framer-motion for a draw-in animation effect.
 */
const SparkLineChart = ({
  data,
  strokeWidth = 2,
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
}) => {
  const SvgRef = React.useRef(null);
  const [width, setWidth] = React.useState(280);
  const [height, setHeight] = React.useState(80);

  const [min, setMin] = React.useState(0);
  const [max, setMax] = React.useState(0);
  const [range, setRange] = React.useState(1);
  const [points, setPoints] = React.useState("");
  React.useEffect(() => {
    if (!data || data.length < 2) return null;
    setMin(Math.min(...data));
    setMax(Math.max(...data));
    setRange(max - min === 0 ? 1 : max - min);
    setPoints(
      data
        .map((d, i) => {
          const x = (i / (data.length - 1)) * width;
          const safeRange = range === 0 ? 1 : range;
          const percent = (d - min) / safeRange;
          const drawableHeight = height - strokeWidth * 2;
          let y = height - percent * drawableHeight - strokeWidth;
          y = Math.max(strokeWidth, Math.min(height - strokeWidth, y));
          return `${x},${y}`;
        })
        .join(" "),
    );
  }, [width, height, min, max, range, data]);
  React.useEffect(() => {
    if (!SvgRef.current) return;
    const cb = () => {
      setWidth(SvgRef.current.parentElement.clientWidth);
      setHeight(SvgRef.current.parentElement.clientHeight);
    };
    cb();
    window.addEventListener("resize", cb);
    return () => {
      window.removeEventListener("resize", cb);
    };
  }, [points]);

  return (
    points && (
      <svg
        ref={SvgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={cn("text-primary", className)}
        aria-label="Sparkline chart showing market trend over the last month"
      >
        <defs>
          <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={`M${points}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.path
          d={`M${points} L${width},${height} L0,${height} Z`}
          fill="url(#sparkline-gradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
        />
      </svg>
    )
  );
};

// --- MAIN COMPONENT ---

export const CryptoStatsCard = React.forwardRef<
  HTMLDivElement,
  CryptoStatsCardProps
>(
  (
    {
      marketCapUSD,
      marketCapChange,
      chartData,
      dominanceData,
      coinData,
      currencySymbol = "USD",
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full h-full rounded-[inherit] border bg-card text-card-foreground shadow-sm p-[3vmin] space-y-[3vmin] overflow-auto no-scrollbar",
          className,
        )}
        {...props}
      >
        {/* Market Cap Section */}
        <div className="space-y-[1vmin]">
          <h3 className="text-[1.5vmin] leading-[1.5vmin] font-medium text-muted-foreground">
            Crypto market cap
          </h3>
          <div className="flex items-baseline gap-[1vmin]">
            <span className="text-[3vmin] leading-[3vmin] font-bold">
              {formatMarketCap(marketCapUSD)}
            </span>
            <span className="text-[2vmin] leading-[2vmin] font-medium text-muted-foreground">
              {currencySymbol}
            </span>
          </div>
          <div
            className={cn(
              "text-[1.5vmin] leading-[1.5vmin] font-semibold",
              marketCapChange >= 0 ? "text-green-500" : "text-destructive",
            )}
          >
            {marketCapChange >= 0 ? "+" : ""}
            {marketCapChange.toFixed(2)}%
          </div>
        </div>

        {/* Chart Section */}
        <div className="flex justify-center my-[2vmin] w-full h-[8vmin]">
          <SparkLineChart data={chartData} />
        </div>

        {/* Dominance Section */}
        <div className="space-y-[1.5vmin]">
          <h3 className="text-[1.5vmin] leading-[1.5vmin] font-medium text-muted-foreground">
            Bitcoin dominance
          </h3>
          <div className="flex items-center justify-between text-[1.3vmin] leading-[1.3vmin]">
            {dominanceData.map((item) => (
              <div key={item.name} className="flex items-center gap-[1vmin]">
                <span
                  className={cn("h-[1vmin] w-[1vmin] rounded-full", item.color)}
                />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-semibold text-card-foreground">
                  {item.percentage.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center h-[1vmin] w-full rounded-full overflow-hidden">
            {dominanceData.map((item) => (
              <div
                key={item.name}
                className={cn("h-full", item.color)}
                style={{ width: `${item.percentage}%` }}
              />
            ))}
          </div>
        </div>

        {/* Coin List Section */}
        <div className="space-y-[2vmin] pt-[2vmin] border-t">
          {coinData.map((coin) => (
            <div
              key={coin.symbol}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  onDragStart={(e) => e.preventDefault()}
                  src={coin.iconUrl}
                  alt={`${coin.name} icon`}
                  className="h-[4vmin] w-[4vmin] rounded-sm"
                />
                <div>
                  <p className="font-semibold text-[2vmin] leading-[2vmin]">
                    {coin.name}
                  </p>
                  <p className="text-[1.3vmin] leading-[1.3vmin] text-muted-foreground">
                    {coin.symbol}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[2vmin] leading-[2vmin]">
                  {formatPrice(coin.price)}{" "}
                  <span className="text-[1.3vmin] leading-[1.3vmin] text-muted-foreground">
                    {currencySymbol}
                  </span>
                </p>
                <p
                  className={cn(
                    "text-[1.3vmin] leading-[1.3vmin] font-medium",
                    coin.change >= 0 ? "text-green-500" : "text-destructive",
                  )}
                >
                  {coin.change >= 0 ? "+" : ""}
                  {coin.change.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);
CryptoStatsCard.displayName = "CryptoStatsCard";
