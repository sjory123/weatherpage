import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (response.ok) return response;

    if (response.status === 429 && retries > 0) { // Rate limit exceeded
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }

    throw new Error(`HTTP error! status: ${response.status}`);
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.message.includes('fetch')) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function getWeatherData(city: string) {
  if (!process.env.NEXT_PUBLIC_ACCUWEATHER_API_KEY) {
    console.error('[API Error] Weather API key is not configured');
    throw new Error('Weather API key is not configured. Please check your environment variables.');
  }

  const startTime = Date.now();

  try {
    console.log(`[API Request] Searching location for city: ${city}`);
    const locationUrl = `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${process.env.NEXT_PUBLIC_ACCUWEATHER_API_KEY}&q=${encodeURIComponent(city)}`;
    console.log(`[API URL] ${locationUrl}`);
    
    const locationResponse = await fetchWithRetry(
      locationUrl,
      { mode: 'cors' }
    );
    
    console.log(`[API Response] Location search status: ${locationResponse.status}`);

    if (!locationResponse.ok) {
      if (locationResponse.status === 401) {
        throw new Error('Invalid API key. Please check your configuration.');
      } else if (locationResponse.status === 503) {
        throw new Error('Weather service is temporarily unavailable. Please try again later.');
      }
      throw new Error(`Location search failed: ${locationResponse.status} ${locationResponse.statusText}`);
    }

    const locations = await locationResponse.json();
    if (!locations || locations.length === 0) {
      throw new Error('City not found');
    }

    const locationKey = locations[0].Key;

    // Get current weather conditions
    console.log(`[API Request] Fetching weather data for location key: ${locationKey}`);
    const weatherUrl = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${process.env.NEXT_PUBLIC_ACCUWEATHER_API_KEY}&details=true`;
    console.log(`[API URL] ${weatherUrl}`);
    
    const weatherResponse = await fetchWithRetry(
      weatherUrl,
      { mode: 'cors' }
    );
    
    console.log(`[API Response] Weather data status: ${weatherResponse.status}`);

    if (!weatherResponse.ok) {
      throw new Error(`Weather data fetch failed: ${weatherResponse.status} ${weatherResponse.statusText}`);
    }

    const weatherData = await weatherResponse.json();
    if (!weatherData || weatherData.length === 0) {
      throw new Error('Weather data not available');
    }

    const current = weatherData[0];
    
    // Transform AccuWeather response to match our interface
    const endTime = Date.now();
    console.log(`[API Performance] Total request time: ${endTime - startTime}ms`);

    return {
      name: locations[0].LocalizedName,
      main: {
        temp: (current.Temperature.Metric.Value),
        humidity: current.RelativeHumidity,
        feels_like: current.RealFeelTemperature.Metric.Value
      },
      weather: [{
        main: current.WeatherText,
        description: current.WeatherText,
        icon: current.WeatherIcon.toString().padStart(2, '0')
      }],
      wind: {
        speed: current.Wind.Speed.Metric.Value / 3.6 // Convert km/h to m/s
      }
    };
  } catch (error) {
    console.error('[API Error] Error fetching weather data:', error);
    console.log(`[API Performance] Failed request time: ${Date.now() - startTime}ms`);
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        throw new Error('Network error: Please check your internet connection and try again.');
      } else if (error.message.includes('rate limit')) {
        throw new Error('Service is busy. Please try again in a few moments.');
      }
      throw error;
    }
    throw new Error('Failed to fetch weather data');
  }
}