import React, { useEffect, useState } from 'react'
import { SafeAreaView, Text, StyleSheet , Button, View} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


interface Weather {
  temperature: string;
  humidity: string;
  THI: string;
  heatStressLevel: string;
  respiration: string;
  bodyTemperature: string;
}

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [weather, setWeather] = useState<Weather>({ temperature: '', humidity: '',THI:'',heatStressLevel: '',
  respiration: '',
  bodyTemperature: '',});

  const [lastRefreshed, setLastRefreshed] = useState<number>(0);

  const calculateTHI = (Tmax: number, RHmin: number): number => {
    return (1.8 * Tmax + 32) - ((0.55 - 0.0055 * RHmin) * (1.8 * Tmax - 26.8));
  };

  const determineHeatStressLevel = (THI: number) => {
    if (THI < 68) {
      return {
        heatStressLevel: 'No heat stress',
        respiration: '40-60 breaths per minute',
        bodyTemperature: '101.5-102.5°F',
      };
    } else if (THI >= 68 && THI <= 71) {
      return {
        heatStressLevel: 'Mild',
        respiration: '60-75 breaths per minute',
        bodyTemperature: '102.5-103°F',
      };
    } else if (THI >= 72 && THI <= 79) {
      return {
        heatStressLevel: 'Mild to moderate',
        respiration: '75-85 breaths per minute',
        bodyTemperature: '103-104°F',
      };
    } else if (THI >= 80 && THI <= 90) {
      return {
        heatStressLevel: 'Moderate to severe',
        respiration: '85-100 breaths per minute',
        bodyTemperature: '104-105°F',
      };
    } else {
      return {
        heatStressLevel: 'Severe',
        respiration: '100-104 breaths per minute',
        bodyTemperature: 'Over 105°F',
      };
    }
  };

  const fetchWeather = async (latitude: number, longitude: number): Promise<void> => {
    const apiKey = '4273d45c3cbf13ffd8ca7200c51ff399';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

    try {
      const response = await axios.get(url);
      const { temp, humidity } = response.data.main;
      const THI = calculateTHI(temp, humidity);
      const { heatStressLevel, respiration, bodyTemperature } = determineHeatStressLevel(THI);
      setWeather({ temperature: temp.toString(), humidity: humidity.toString(), THI: THI.toString(), heatStressLevel,
        respiration,
        bodyTemperature,});
      setLastRefreshed(Date.now());
     } catch (error) {
      console.error(error);
    }
  };


  const handleRefresh = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(latitude, longitude);
      },
      (error) => console.error(error),
      { enableHighAccuracy: true }
    );
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


  const isRefreshEnabled = Date.now() - lastRefreshed >= 5 * 60 * 1000;


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Temperature: {weather.temperature}°C</Text>
      <Text style={styles.text}>Humidity: {weather.humidity}%</Text>
      <Text style={styles.text}>THI: {weather.THI}</Text>
      <Text style={styles.text}>Heat Stress Level: {weather.heatStressLevel}</Text>
      <Text style={styles.text}>Respiration: {weather.respiration}</Text>
      <Text style={styles.text}>Body Temperature: {weather.bodyTemperature}</Text>
      <View style={styles.buttonContainer}>
      <Button title="Refresh" onPress={handleRefresh} disabled={!isRefreshEnabled} />
      <Button title="Next" onPress={() => navigation.navigate('Details')} />
      </View>
    </SafeAreaView>
  );
};

const DetailsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Details Screen</Text>
      <View style={styles.buttonContainer}>
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
};

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 20, 
  },
  text: {
    fontSize: 18
  }
});

export default App;

