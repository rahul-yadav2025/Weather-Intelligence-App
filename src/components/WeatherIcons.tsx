import React from 'react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudFog,
  CloudSun,
  Moon
} from 'lucide-react';

interface WeatherIconProps {
  code: number;
  isDay?: number;
  className?: string;
}

export function WeatherIcon({ code, isDay = 1, className = "" }: WeatherIconProps) {
  const iconProps = { className };

  if (code === 0) return isDay ? <Sun {...iconProps} /> : <Moon {...iconProps} />;
  if (code === 1 || code === 2) return isDay ? <CloudSun {...iconProps} /> : <Cloud {...iconProps} />;
  if (code === 3) return <Cloud {...iconProps} />;
  if (code === 45 || code === 48) return <CloudFog {...iconProps} />;
  if (code >= 51 && code <= 67) return <CloudRain {...iconProps} />;
  if (code >= 71 && code <= 86) return <CloudSnow {...iconProps} />;
  if (code >= 95) return <CloudLightning {...iconProps} />;

  return <Sun {...iconProps} />;
}
