import React, { useState, useEffect } from "react";
import { Search, MapPin, Wind, Droplets, Thermometer, Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Location, WeatherData } from "./types";
import { searchLocations, getWeatherData, getAiRecommendation, getWeatherDescription } from "./api";
import { WeatherIcon } from "./components/WeatherIcons";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendation, setRecommendation] = useState<string>("");
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingRec, setLoadingRec] = useState(false);

  useEffect(() => {
    // Default location (New York)
    handleSelectLocation({
      id: 5128581,
      name: "New York",
      latitude: 40.71427,
      longitude: -74.00597,
      country: "United States",
      admin1: "New York",
    });
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 2) {
        setIsSearching(true);
        const results = await searchLocations(query);
        setSearchResults(results);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectLocation = async (loc: Location) => {
    setShowDropdown(false);
    setQuery("");
    setLocation(loc);
    setLoadingWeather(true);
    setWeather(null);
    setRecommendation("");

    const data = await getWeatherData(loc.latitude, loc.longitude);
    setWeather(data);
    setLoadingWeather(false);

    if (data) {
      setLoadingRec(true);
      const locString = `${loc.name}${loc.admin1 ? `, ${loc.admin1}` : ""}, ${loc.country}`;
      const rec = await getAiRecommendation(data, locString);
      setRecommendation(rec);
      setLoadingRec(false);
    }
  };

  const chartData = weather?.hourly.time.slice(0, 24).map((time, index) => ({
    time: format(parseISO(time), "ha"),
    temp: Math.round(weather.hourly.temperature_2m[index]),
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-blue-600">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-xl font-semibold tracking-tight hidden sm:block">Weather Intelligence</h1>
          </div>

          <div className="relative w-full max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search city..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
              />
            </div>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                >
                  {isSearching ? (
                    <div className="p-4 text-sm text-slate-500 text-center">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <ul>
                      {searchResults.map((res) => (
                        <li key={res.id}>
                          <button
                            onClick={() => handleSelectLocation(res)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col transition-colors"
                          >
                            <span className="font-medium text-slate-900">{res.name}</span>
                            <span className="text-xs text-slate-500">
                              {res.admin1 ? `${res.admin1}, ` : ""}
                              {res.country}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-sm text-slate-500 text-center">No results found</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loadingWeather && !weather ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : weather && location ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: Current & AI */}
            <div className="lg:col-span-4 space-y-6">
              {/* Current Weather Card */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-blue-500 opacity-10">
                  <WeatherIcon code={weather.current.weather_code} isDay={weather.current.is_day} className="w-48 h-48" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-slate-500 mb-8">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{location.name}</span>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-7xl font-bold tracking-tighter">
                        {Math.round(weather.current.temperature_2m)}°
                      </span>
                    </div>
                    <p className="text-lg font-medium text-slate-700 capitalize">
                      {getWeatherDescription(weather.current.weather_code)}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Feels like {Math.round(weather.current.apparent_temperature)}°
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                      <Wind className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Wind</p>
                        <p className="text-sm font-semibold text-slate-900">{weather.current.wind_speed_10m} km/h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                      <Droplets className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Humidity</p>
                        <p className="text-sm font-semibold text-slate-900">{weather.current.relative_humidity_2m}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommendation Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-md text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-blue-200" />
                  <h3 className="font-semibold text-blue-50">AI Insight</h3>
                </div>
                
                <div className="min-h-[100px] flex items-center">
                  {loadingRec ? (
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-blue-200 text-sm">Analyzing conditions...</span>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-blue-50 font-medium">
                      {recommendation}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Charts & Forecast */}
            <div className="lg:col-span-8 space-y-6">
              {/* Hourly Chart */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-slate-400" />
                    24-Hour Forecast
                  </h3>
                </div>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="time" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        dy={10}
                        minTickGap={30}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        tickFormatter={(value) => `${value}°`}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                        formatter={(value: number) => [`${value}°`, 'Temperature']}
                        labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="temp" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorTemp)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 7-Day Forecast */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-6">7-Day Forecast</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
                  {weather.daily.time.slice(0, 7).map((time, idx) => (
                    <div key={time} className="flex flex-col items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                      <span className="text-xs font-medium text-slate-500 mb-2">
                        {idx === 0 ? "Today" : format(parseISO(time), "EEE")}
                      </span>
                      <WeatherIcon 
                        code={weather.daily.weather_code[idx]} 
                        className="w-8 h-8 text-slate-700 mb-3" 
                      />
                      <div className="flex gap-2 text-sm">
                        <span className="font-semibold text-slate-900">{Math.round(weather.daily.temperature_2m_max[idx])}°</span>
                        <span className="text-slate-400">{Math.round(weather.daily.temperature_2m_min[idx])}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </main>
    </div>
  );
}
