'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { getWeatherData } from '@/lib/utils';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

export default function Home() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Silently fail clipboard operations as they're not critical
    }
  };

  const handleSearch = async () => {
    if (!city) {
      setError('Please enter a city name');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await getWeatherData(city);
      setWeather(data);
      // Don't automatically copy to clipboard to avoid permission errors
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data. Please try again.';
      setError(errorMessage);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-100 to-blue-200 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-900 dark:text-blue-100">
          Global Weather Checker
        </h1>
        
        <div className="flex gap-2 mb-8 justify-center">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white w-64"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {error && (
          <div className="text-red-500 text-center mb-4">{error}</div>
        )}

        {weather && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-white">
              {weather.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <img
                  src={`https://developer.accuweather.com/sites/default/files/${weather.weather[0].icon}-s.png`}
                  alt={weather.weather[0].description}
                  className="mx-auto"
                />
                <p className="text-4xl font-bold text-gray-800 dark:text-white">
                  {Math.round(weather.main.temp)}°C
                </p>
                <p className="text-gray-600 dark:text-gray-300 capitalize">
                  {weather.weather[0].description}
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Feels like</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {Math.round(weather.main.feels_like)}°C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Humidity</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {weather.main.humidity}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Wind Speed</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {weather.wind.speed} m/s
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
