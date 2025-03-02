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
      console.log('[UI] Initiating weather search for:', city);
      const data = await getWeatherData(city);
      console.log('[UI] Weather data received:', data);
      setWeather(data);
    } catch (err) {
      console.error('[UI] Error fetching weather:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data. Please try again.';
      setError(errorMessage);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-pink-200 via-purple-100 to-blue-200 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-6xl font-bold text-center mb-12 text-purple-600 dark:text-purple-300 animate-bounce-gentle drop-shadow-lg">
          🌈 Global Weather Checker ☀️
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center items-center transition-all duration-300 ease-in-out">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="✨ Enter city name..."
            className="search-input px-6 py-3 rounded-full text-lg w-full sm:w-96 text-purple-700 dark:text-purple-200 placeholder-purple-400 dark:placeholder-purple-500 border-2 border-purple-300 dark:border-purple-600 focus:border-purple-500 dark:focus:border-purple-400"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="search-button w-full sm:w-auto px-8 py-3 text-lg font-semibold text-white rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300"
          >
            <Search className="w-5 h-5 mr-2" />
            {loading ? '🔍 Searching...' : '🔍 Search'}
          </Button>
        </div>

        {error && (
          <div className="text-red-500 text-center mb-4 p-4 bg-red-100/90 dark:bg-red-900/30 rounded-2xl animate-shake backdrop-blur-sm border-2 border-red-300 dark:border-red-700">
            ❌ {error}
          </div>
        )}

        {weather && (
          <div className="weather-card bg-white/90 dark:bg-gray-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700 hover:transform hover:scale-102 transition-all duration-300">
            <h2 className="text-4xl font-bold mb-6 text-center text-purple-600 dark:text-purple-300">
              🏙️ {weather.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="text-center p-4 bg-purple-100/50 dark:bg-purple-900/50 rounded-2xl border border-purple-200 dark:border-purple-700">
                  <p className="text-5xl font-bold text-purple-700 dark:text-purple-300 mb-2">{Math.round(weather.main.temp)}°C</p>
                  <p className="text-lg text-purple-600 dark:text-purple-400">Feels like {Math.round(weather.main.feels_like)}°C</p>
                </div>
                <div className="text-center">
                  <img
                    src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                    alt={weather.weather[0].description}
                    className="weather-icon mx-auto w-24 h-24"
                  />
                  <p className="text-xl text-purple-600 dark:text-purple-400 capitalize">{weather.weather[0].description}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-purple-100/50 dark:bg-purple-900/50 rounded-2xl border border-purple-200 dark:border-purple-700">
                  <p className="text-lg mb-2">
                    <span className="font-semibold text-purple-600 dark:text-purple-400">💧 Humidity:</span>
                    <span className="ml-2 text-purple-700 dark:text-purple-300">{weather.main.humidity}%</span>
                  </p>
                  <p className="text-lg">
                    <span className="font-semibold text-purple-600 dark:text-purple-400">💨 Wind Speed:</span>
                    <span className="ml-2 text-purple-700 dark:text-purple-300">{weather.wind.speed} m/s</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
