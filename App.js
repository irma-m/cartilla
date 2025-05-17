import React, { useEffect } from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import MedicamentosScreen from './screens/MedicamentosScreen';
import BathScreen from './screens/BathScreen';
import DewormingScreen from './screens/DewormingScreen';
import VaccinesScreen from './screens/VaccinesScreen';



// Configuración para manejar notificaciones en la app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Función para registrar permisos y obtener el token de notificación
async function registerForPushNotificationsAsync() {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permiso denegado', 'No se concedieron permisos para recibir notificaciones.');
      return;
    }

    const token = await Notifications.getExpoPushTokenAsync();
    console.log('Expo Push Token:', token.data);
  } else {
    Alert.alert('Aviso', 'Las notificaciones solo funcionan en dispositivos reales.');
  }
}

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cartilla Digital de Chewie</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Medicamentos')}>
        <Icon name="pill" size={30} color="#fff" />
        <Text style={styles.buttonText}>Medicamentos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Baños')}>
        <Icon name="shower" size={30} color="#fff" />
        <Text style={styles.buttonText}>Baños</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Desparasitaciones')}>
        <Icon name="dog" size={30} color="#fff" />
        <Text style={styles.buttonText}>Desparasitaciones</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Vacunas')}>
        <Icon name="needle" size={30} color="#fff" />
        <Text style={styles.buttonText}>Vacunas</Text>
      </TouchableOpacity>

      {/* Botón para probar notificaciones */}
      
    </View>
  );
};

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#ffcc00' } }}>
        <Stack.Screen name="Inicio" component={HomeScreen} />
        <Stack.Screen name="Medicamentos" component={MedicamentosScreen} />
        <Stack.Screen name="Baños" component={BathScreen} />
        <Stack.Screen name="Desparasitaciones" component={DewormingScreen} />
        <Stack.Screen name="Vacunas" component={VaccinesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef9c3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#d97706',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d97706',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: 220,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
});

export default App;
