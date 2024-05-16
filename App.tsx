import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';

interface Weather {
  temperature: string;
  humidity: string;
}

const App: React.FC = () => {
  const [weather, setWeather] = useState<Weather>({ temperature: '', humidity: '' });

  const fetchWeather = async (latitude: number, longitude: number): Promise<void> => {
    const apiKey = '4273d45c3cbf13ffd8ca7200c51ff399';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

    try {
      const response = await axios.get(url);
      const { temp, humidity } = response.data.main;
      setWeather({ temperature: temp.toString(), humidity: humidity.toString() });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(latitude, longitude);
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, distanceFilter: 100 }
    );

    return () => Geolocation.clearWatch(watchId);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Temperature: {weather.temperature}°C</Text>
      <Text style={styles.text}>Humidity: {weather.humidity}%</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: 18
  }
});

export default App;

