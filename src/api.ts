import { Location, WeatherData } from "./types";

export async function searchLocations(query: string): Promise<Location[]> {
  if (!query) return [];
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Error searching locations:", error);
    return [];
  }
}

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
}

export async function getAiRecommendation(weatherData: WeatherData, location: string): Promise<string> {
  try {
    const res = await fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weatherData, location }),
    });
    if (!res.ok) {
      throw new Error("Failed to get recommendation");
    }
    const data = await res.json();
    return data.recommendation;
  } catch (error) {
    console.error("Error fetching AI recommendation:", error);
    return "AI recommendations are currently unavailable. Stay safe and check the local forecast!";
  }
}

export function getWeatherDescription(code: number): string {
  const codes: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    95: "Thunderstorm",
  };
  return codes[code] || "Unknown weather";
}
