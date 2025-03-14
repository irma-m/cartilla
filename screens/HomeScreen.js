import React from 'react';
import { View, Text, Button } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <Text>¡Bienvenido a la Cartilla de Chewie!</Text>
      <Button title="Medicamentos" onPress={() => navigation.navigate('Medicamentos')} />
      <Button title="Baños" onPress={() => navigation.navigate('Baños')} />
      <Button title="Desparasitaciones" onPress={() => navigation.navigate('Desparasitaciones')} />
    </View>
  );
};

export default HomeScreen;
