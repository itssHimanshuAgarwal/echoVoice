import { useState, useEffect, useCallback } from 'react';

export interface LocationData {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: {
    city?: string;
    suburb?: string;
    road?: string;
    house_number?: string;
    postcode?: string;
    country?: string;
  };
  readableLocation: string;
  accuracy: number;
}

export interface TimeData {
  currentTime: string; // HH:MM format
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  timestamp: Date;
}

export const useAutoLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [currentTime, setCurrentTime] = useState<TimeData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');

  // Update time every minute
  const updateTime = useCallback(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hours >= 5 && hours < 12) {
      timeOfDay = 'morning';
    } else if (hours >= 12 && hours < 17) {
      timeOfDay = 'afternoon';
    } else if (hours >= 17 && hours < 21) {
      timeOfDay = 'evening';
    } else {
      timeOfDay = 'night';
    }

    setCurrentTime({
      currentTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      timeOfDay,
      timestamp: now
    });
  }, []);

  // Reverse geocode coordinates to readable address
  const reverseGeocode = useCallback(async (latitude: number, longitude: number): Promise<string> => {
    try {
      // Using OpenStreetMap Nominatim (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'EchoVoice-App/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      const address = data.address || {};
      
      // Create a readable location name
      let readableLocation = 'Unknown Location';
      
      if (address.house_number && address.road) {
        readableLocation = `${address.house_number} ${address.road}`;
      } else if (address.road) {
        readableLocation = address.road;
      } else if (address.suburb || address.neighbourhood) {
        readableLocation = address.suburb || address.neighbourhood;
      } else if (address.city || address.town || address.village) {
        readableLocation = address.city || address.town || address.village;
      }
      
      // Add context based on place type
      if (address.amenity) {
        const amenityTypes: { [key: string]: string } = {
          'hospital': 'Hospital',
          'clinic': 'Clinic',
          'restaurant': 'Restaurant',
          'cafe': 'Cafe',
          'shop': 'Shop',
          'supermarket': 'Store',
          'school': 'School',
          'university': 'University',
          'bank': 'Bank',
          'pharmacy': 'Pharmacy',
          'library': 'Library',
          'gym': 'Gym',
          'park': 'Park'
        };
        
        if (amenityTypes[address.amenity]) {
          readableLocation = amenityTypes[address.amenity];
        }
      }
      
      return readableLocation;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return 'Location detected';
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      // Get readable location
      const readableLocation = await reverseGeocode(latitude, longitude);
      
      setCurrentLocation({
        coordinates: { latitude, longitude },
        address: {}, // Will be populated by reverse geocoding if needed
        readableLocation,
        accuracy
      });
      
      setPermissionStatus('granted');
    } catch (error: any) {
      console.error('Location error:', error);
      
      if (error.code === 1) { // PERMISSION_DENIED
        setLocationError('Location access denied. Please enable location permissions.');
        setPermissionStatus('denied');
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        setLocationError('Location information unavailable.');
      } else if (error.code === 3) { // TIMEOUT
        setLocationError('Location request timed out.');
      } else {
        setLocationError('Failed to get location.');
      }
    } finally {
      setIsLoadingLocation(false);
    }
  }, [reverseGeocode]);

  // Check permission status
  const checkPermissions = useCallback(async () => {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
        
        if (result.state === 'granted') {
          getCurrentLocation();
        }
      } catch (error) {
        console.error('Permission check failed:', error);
      }
    }
  }, [getCurrentLocation]);

  // Initialize
  useEffect(() => {
    updateTime();
    checkPermissions();
    
    // Update time every minute
    const timeInterval = setInterval(updateTime, 60000);
    
    return () => {
      clearInterval(timeInterval);
    };
  }, [updateTime, checkPermissions]);

  return {
    currentLocation,
    currentTime,
    isLoadingLocation,
    locationError,
    permissionStatus,
    getCurrentLocation,
    refreshLocation: getCurrentLocation,
  };
};