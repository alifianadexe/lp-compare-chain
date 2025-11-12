"use client";

import { useEffect, useState } from "react";

// TypeScript types
type CoinPrices = {
  [key: string]: number;
};

// CoinGecko API IDs
const COIN_IDS = {
  HYPE: "hyperliquid",
  SUI: "sui",
  SOL: "solana",
};

// Token colors and logos
const TOKEN_STYLES = {
  HYPE: {
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    logo: "https://assets.coingecko.com/coins/images/50882/standard/hyperliquid.jpg",
  },
  SUI: {
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    logo: "https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg",
  },
  SOL: {
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  },
};

export default function Page() {
  const [prices, setPrices] = useState<CoinPrices>({});
  const [historicalPrices, setHistoricalPrices] = useState<CoinPrices>({});

  // Set default date to last month
  const getLastMonthDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getLastMonthDate());
  const [loading, setLoading] = useState(true);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const coins = ["HYPE", "SUI", "SOL"];

  // Fetch live prices from CoinGecko
  const fetchPrices = async () => {
    try {
      const ids = Object.values(COIN_IDS).join(",");
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
      );
      const data = await response.json();

      const newPrices: CoinPrices = {
        HYPE: data[COIN_IDS.HYPE]?.usd || 0,
        SUI: data[COIN_IDS.SUI]?.usd || 0,
        SOL: data[COIN_IDS.SOL]?.usd || 0,
      };

      setPrices(newPrices);
      setLastUpdate(new Date().toLocaleTimeString());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching prices:", error);
      setLoading(false);
    }
  };

  // Fetch historical prices for a specific date
  const fetchHistoricalPrices = async (date: string) => {
    setLoadingHistorical(true);
    try {
      // Convert date to DD-MM-YYYY format for CoinGecko
      const dateObj = new Date(date);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      const historicalData: CoinPrices = {};

      // Fetch historical data for each coin
      for (const [symbol, id] of Object.entries(COIN_IDS)) {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${id}/history?date=${formattedDate}`
        );
        const data = await response.json();
        historicalData[symbol] = data.market_data?.current_price?.usd || 0;
      }

      setHistoricalPrices(historicalData);
      setLoadingHistorical(false);
    } catch (error) {
      console.error("Error fetching historical prices:", error);
      setLoadingHistorical(false);
    }
  };

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) {
      fetchHistoricalPrices(date);
    } else {
      setHistoricalPrices({});
    }
  };

  useEffect(() => {
    fetchPrices();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch historical prices on mount with default date
  useEffect(() => {
    if (selectedDate) {
      fetchHistoricalPrices(selectedDate);
    }
  }, [selectedDate]);

  // Calculate ratio between two coins
  const calculateRatio = (
    coin1: string,
    coin2: string,
    priceSet: CoinPrices
  ): string => {
    if (coin1 === coin2) return "1.0000";
    if (!priceSet || Object.keys(priceSet).length === 0) return "0.0000";
    const price1 = priceSet[coin1] || 0;
    const price2 = priceSet[coin2] || 0;
    if (price2 === 0) return "0.0000";
    return (price1 / price2).toFixed(4);
  };

  // Calculate percentage change between historical and current ratio
  const calculateChange = (coin1: string, coin2: string): number => {
    if (coin1 === coin2 || Object.keys(historicalPrices).length === 0) return 0;

    const currentRatio = parseFloat(calculateRatio(coin1, coin2, prices));
    const historicalRatio = parseFloat(
      calculateRatio(coin1, coin2, historicalPrices)
    );

    if (historicalRatio === 0) return 0;
    return ((currentRatio - historicalRatio) / historicalRatio) * 100;
  };

  // Generate AI-like insights based on price changes
  const generateInsights = (): string[] => {
    const insights: string[] = [];

    if (Object.keys(historicalPrices).length === 0) return insights;

    // Calculate individual coin percentage changes
    const coinChanges = coins.map((coin) => {
      const current = prices[coin] || 0;
      const historical = historicalPrices[coin] || 0;
      if (historical === 0) return { coin, change: 0 };
      return {
        coin,
        change: ((current - historical) / historical) * 100,
      };
    });

    // Find best and worst performers
    const sorted = [...coinChanges].sort((a, b) => b.change - a.change);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    // LP Strategy Insights - Take profit from gainers, buy dips
    if (best.change > 5 && worst.change < 0) {
      insights.push(
        `🎯 LP Strategy: ${best.coin} gained ${best.change.toFixed(1)}% while ${
          worst.coin
        } declined ${Math.abs(worst.change).toFixed(
          1
        )}%. Consider taking profit from ${best.coin} LP and moving to ${
          worst.coin
        } LP to buy the dip.`
      );
    } else if (best.change > 10) {
      insights.push(
        `💰 Take Profit: ${best.coin} surged ${best.change.toFixed(
          1
        )}% since ${new Date(
          selectedDate
        ).toLocaleDateString()}. Consider rebalancing LP to lock in gains.`
      );
    }

    if (worst.change < -10) {
      insights.push(
        `� Buy Opportunity: ${worst.coin} dropped ${Math.abs(
          worst.change
        ).toFixed(
          1
        )}%. Good entry point for LP position - buy low, sell high strategy.`
      );
    }

    // Pair-specific insights for ratio changes
    const suiSolChange = calculateChange("SUI", "SOL");
    const suiHypeChange = calculateChange("HYPE", "SUI");
    const solHypeChange = calculateChange("SOL", "HYPE");

    if (Math.abs(suiSolChange) > 10) {
      if (suiSolChange > 0) {
        insights.push(
          `🔄 SUI/SOL: Ratio up ${suiSolChange.toFixed(
            1
          )}%. SUI is expensive relative to SOL - consider rotating SUI LP → SOL LP.`
        );
      } else {
        insights.push(
          `🔄 SOL/SUI: Ratio up ${Math.abs(suiSolChange).toFixed(
            1
          )}%. SOL is expensive relative to SUI - consider rotating SOL LP → SUI LP.`
        );
      }
    }

    if (Math.abs(suiHypeChange) > 10) {
      if (suiHypeChange > 0) {
        insights.push(
          `🔄 SUI/HYPE: Ratio up ${suiHypeChange.toFixed(
            1
          )}%. Move HYPE LP → SUI LP to capture undervalued asset.`
        );
      } else {
        insights.push(
          `🔄 HYPE/SUI: Ratio up ${Math.abs(suiHypeChange).toFixed(
            1
          )}%. Move SUI LP → HYPE LP to capture undervalued asset.`
        );
      }
    }

    if (insights.length === 0) {
      insights.push(
        "📊 Markets are relatively stable. All pairs showing minimal volatility - good time to hold current LP positions."
      );
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          Crypto Comparation For LP-ing
        </h1>

        {/* Last Update */}
        <p className="text-xl text-gray-600 text-center mb-8">
          {loading ? "Loading prices..." : `Last updated: ${lastUpdate}`}
        </p>

        {/* Minimalistic Price Info */}
        <div className="flex justify-center items-center gap-6 mb-4 text-sm">
          {coins.map((coin, index) => (
            <div key={coin} className="flex items-center gap-2">
              <img
                src={TOKEN_STYLES[coin as keyof typeof TOKEN_STYLES].logo}
                alt={coin}
                className="w-5 h-5 rounded-full"
              />
              <span
                className={`font-semibold ${
                  TOKEN_STYLES[coin as keyof typeof TOKEN_STYLES].color
                }`}
              >
                {coin}:
              </span>
              <span className="text-gray-600">
                {loading ? "..." : `$${prices[coin]?.toFixed(2) || "0.00"}`}
              </span>
              {index < coins.length - 1 && (
                <span className="text-gray-400">•</span>
              )}
            </div>
          ))}
        </div>

        {/* Minimalist Pair Ratios - More Prominent */}
        <div className="flex justify-center items-center gap-8 mb-12 text-lg text-gray-700">
          <div className="flex items-center gap-2">
            <img
              src={TOKEN_STYLES.HYPE.logo}
              alt="SUI"
              className="w-6 h-6 rounded-full"
            />
            <span className="font-semibold">
              <span className={TOKEN_STYLES.HYPE.color}>HYPE</span>
              <span className="text-gray-400">/</span>
              <span className={TOKEN_STYLES.SUI.color}>SUI</span>:
            </span>
            <span>
              {loading ? "..." : calculateRatio("HYPE", "SUI", prices)}
            </span>
          </div>
          <span className="text-gray-400">|</span>
          <div className="flex items-center gap-2">
            <img
              src={TOKEN_STYLES.SOL.logo}
              alt="SOL"
              className="w-6 h-6 rounded-full"
            />
            <span className="font-semibold">
              <span className={TOKEN_STYLES.SOL.color}>SOL</span>
              <span className="text-gray-400">/</span>
              <span className={TOKEN_STYLES.HYPE.color}>HYPE</span>:
            </span>
            <span>
              {loading ? "..." : calculateRatio("SOL", "HYPE", prices)}
            </span>
          </div>
          <span className="text-gray-400">|</span>
          <div className="flex items-center gap-2">
            <img
              src={TOKEN_STYLES.SOL.logo}
              alt="SOL"
              className="w-6 h-6 rounded-full"
            />
            <span className="font-semibold">
              <span className={TOKEN_STYLES.SOL.color}>SOL</span>
              <span className="text-gray-400">/</span>
              <span className={TOKEN_STYLES.SUI.color}>SUI</span>:
            </span>
            <span>
              {loading ? "..." : calculateRatio("SOL", "SUI", prices)}
            </span>
          </div>
        </div>

        {/* Matrix Comparison Table */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-300">
          {/* Date Picker - Top Left */}
          <div className="bg-gray-100 px-8 py-4 border-b-2 border-gray-300 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-700">
                Compare with:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                max={new Date().toISOString().split("T")[0]}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
              />
              {loadingHistorical && (
                <span className="text-sm text-gray-600">Loading...</span>
              )}
            </div>
            {selectedDate && !loadingHistorical && (
              <span className="text-sm text-gray-600">
                Comparing current prices with{" "}
                {new Date(selectedDate).toDateString()}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-8 py-6 text-left text-2xl font-bold text-white border-r-2 border-gray-700">
                    Pair Ratio
                  </th>
                  {coins.map((coin) => (
                    <th
                      key={coin}
                      className="px-8 py-6 text-center border-r-2 border-gray-700 last:border-r-0"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <img
                          src={
                            TOKEN_STYLES[coin as keyof typeof TOKEN_STYLES].logo
                          }
                          alt={coin}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-2xl font-bold text-white">
                          {coin}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coins.map((rowCoin, rowIndex) => (
                  <tr
                    key={rowCoin}
                    className={`${
                      rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-8 py-6 border-r-2 border-gray-300 bg-gray-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            TOKEN_STYLES[rowCoin as keyof typeof TOKEN_STYLES]
                              .logo
                          }
                          alt={rowCoin}
                          className="w-8 h-8 rounded-full"
                        />
                        <span
                          className={`text-2xl font-bold ${
                            TOKEN_STYLES[rowCoin as keyof typeof TOKEN_STYLES]
                              .color
                          }`}
                        >
                          {rowCoin}
                        </span>
                      </div>
                    </td>
                    {coins.map((colCoin) => {
                      const ratio = calculateRatio(rowCoin, colCoin, prices);
                      const isDiagonal = rowCoin === colCoin;
                      const changePercent = calculateChange(rowCoin, colCoin);
                      const hasComparison =
                        Object.keys(historicalPrices).length > 0;

                      // Determine background color based on change percentage
                      let bgColor = "";
                      if (hasComparison && !isDiagonal) {
                        if (changePercent > 0) {
                          // Green shades for positive changes
                          if (changePercent > 20) bgColor = "bg-green-200";
                          else if (changePercent > 10) bgColor = "bg-green-100";
                          else if (changePercent > 0) bgColor = "bg-green-50";
                        } else if (changePercent < 0) {
                          // Red shades for negative changes
                          if (changePercent < -20) bgColor = "bg-red-200";
                          else if (changePercent < -10) bgColor = "bg-red-100";
                          else if (changePercent < 0) bgColor = "bg-red-50";
                        }
                      }

                      return (
                        <td
                          key={colCoin}
                          className={`px-8 py-6 text-center border-r-2 border-gray-200 last:border-r-0 ${
                            isDiagonal
                              ? "bg-gray-200 text-gray-500"
                              : bgColor || "text-gray-900"
                          }`}
                        >
                          <div className="text-xl font-semibold">
                            {loading ? "..." : ratio}
                          </div>
                          {hasComparison && !isDiagonal && (
                            <div
                              className={`text-sm font-bold mt-1 ${
                                changePercent > 0
                                  ? "text-green-700"
                                  : changePercent < 0
                                  ? "text-red-700"
                                  : "text-gray-500"
                              }`}
                            >
                              {changePercent > 0
                                ? "▲"
                                : changePercent < 0
                                ? "▼"
                                : ""}
                              {changePercent !== 0
                                ? ` ${Math.abs(changePercent).toFixed(2)}%`
                                : " 0.00%"}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Insights Section */}
        {insights.length > 0 && (
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💡</span> Market Insights
            </h2>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 shadow-sm border border-blue-100"
                >
                  <p className="text-lg text-gray-800">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Text */}
        <p className="text-lg text-gray-600 text-center mt-8">
          Matrix shows how many units of the column coin equals 1 unit of the
          row coin
        </p>
      </div>
    </div>
  );
}
