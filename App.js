import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MedicamentosScreen from './screens/MedicamentosScreen';
import BathScreen from './screens/BathScreen';

// Pantallas vacías por ahora

const DesparasitacionesScreen = () => <View><Text>Pantalla de Desparasitaciones</Text></View>;

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
    </View>
  );
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#ffcc00' } }}>
        <Stack.Screen name="Inicio" component={HomeScreen} />
        <Stack.Screen name="Medicamentos" component={MedicamentosScreen} />
        <Stack.Screen name="Baños" component={BathScreen} />
        <Stack.Screen name="Desparasitaciones" component={DesparasitacionesScreen} />
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
    width: 200,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
});



export default App;
