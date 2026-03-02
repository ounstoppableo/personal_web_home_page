import { useEffect, useRef, useState } from "react";
import { CryptoStatsCard } from "./stats-card";
export default function StatsCardWithData() {
  const [marketCapData, setMarketCapData] = useState({
    usd: 4000000000000, // 4T
    change: 7.79,
  });

  const [sparklineChartData, setSparklineChartData] = useState([
    50, 52, 48, 55, 60, 58, 62, 70, 68, 75, 72, 80, 78, 85, 82, 70, 65, 72, 78,
    88, 92, 90,
  ]);

  const [dominanceData, setDominanceData] = useState([
    { name: "Bitcoin", percentage: 59.02, color: "bg-blue-500" },
    { name: "Ethereum", percentage: 13.11, color: "bg-red-500" },
    { name: "Others", percentage: 27.87, color: "bg-cyan-400" },
  ]);

  const [coinData, setCoinData] = useState([
    {
      iconUrl: "/XTVCBTC--big.svg",
      name: "Bitcoin",
      symbol: "BTCUSD",
      price: 118624,
      change: 0.04,
    },
    {
      iconUrl: "/XTVCETH--big.svg",
      name: "Ethereum",
      symbol: "ETHUSD",
      price: 4349.2,
      change: 0.04,
    },
  ]);

  useEffect(() => {
    fetch("/coinLore/global/").then(async (res) => {
      const body = await res.json();
      if (body && body.length !== 0) {
        setMarketCapData({
          usd: body[0].total_mcap,
          change: +body[0].mcap_change,
        });
        setDominanceData([
          {
            name: "Bitcoin",
            percentage: +body[0].btc_d,
            color: "bg-blue-500",
          },
          {
            name: "Ethereum",
            percentage: +body[0].eth_d,
            color: "bg-red-500",
          },
          {
            name: "Others",
            percentage: 100 - body[0].btc_d - body[0].eth_d,
            color: "bg-cyan-400",
          },
        ]);
      }
    });
    fetch("/coinLore/ticker/?id=90,80").then(async (res) => {
      const body = await res.json();
      if (body && body.length !== 0) {
        setCoinData([
          {
            iconUrl: "/XTVCBTC--big.svg",
            name: "Bitcoin",
            symbol: "BTCUSD",
            price: +body[0].price_usd,
            change: +body[0].percent_change_24h,
          },
          {
            iconUrl: "/XTVCETH--big.svg",
            name: "Ethereum",
            symbol: "ETHUSD",
            price: +body[1].price_usd,
            change: +body[1].percent_change_24h,
          },
        ]);
      }
    });
    fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily",
      {
        headers: {
          "content-type": "application/json",
          "x-cg-demo-api-key": import.meta.env.VITE_COINGECKO_API_KEY,
        },
      }
    ).then(async (res) => {
      const body = await res.json();
      if (body && body.prices && body.prices.length !== 0) {
        setSparklineChartData(body.prices.map((item) => item[1]));
      }
    });
  }, []);

  return (
    <div className="w-full h-full rounded-[inherit]">
      <CryptoStatsCard
        marketCapUSD={marketCapData.usd}
        marketCapChange={marketCapData.change}
        chartData={sparklineChartData}
        dominanceData={dominanceData}
        coinData={coinData}
      />
    </div>
  );
}
