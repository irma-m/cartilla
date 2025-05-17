import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Icon, ButtonGroup } from 'react-native-elements';

const MedicationsScreen = () => {
  const [baths, setBaths] = useState([]);
  const [date, setDate] = useState(new Date());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const places = ['Casa', 'Veterinaria', 'Petco'];
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadBaths();
  }, []);

  const loadBaths = async () => {
    try {
      const storedBaths = await AsyncStorage.getItem('baths');
      if (storedBaths) setBaths(JSON.parse(storedBaths));
    } catch (error) {
      console.error('Error loading baths:', error);
    }
  };

  const saveBath = async () => {
    try {
      let newBaths;
      if (editingId) {
        newBaths = baths.map(bath =>
          bath.id === editingId ? { id: editingId, date: date.toISOString().split('T')[0], place: places[selectedIndex] } : bath
        );
        setEditingId(null);
      } else {
        newBaths = [...baths, { id: Date.now(), date: date.toISOString().split('T')[0], place: places[selectedIndex] }];
      }
      setBaths(newBaths);
      await AsyncStorage.setItem('baths', JSON.stringify(newBaths));
      Alert.alert('Guardado', 'Baño registrado correctamente.');
    } catch (error) {
      console.error('Error saving bath:', error);
    }
  };

  const deleteBath = async (id) => {
    try {
      const updatedBaths = baths.filter(bath => bath.id !== id);
      setBaths(updatedBaths);
      await AsyncStorage.setItem('baths', JSON.stringify(updatedBaths));
    } catch (error) {
      console.error('Error deleting bath:', error);
    }
  };

  const clearAllBaths = async () => {
    Alert.alert(
      "Eliminar todos los baños",
      "¿Estás seguro de que quieres borrar todos los registros de baños?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, eliminar",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('baths');
              setBaths([]);
            } catch (error) {
              console.error('Error clearing all baths:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Registrar Baño</Text>

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>Fecha del Baño:</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ padding: 10, backgroundColor: '#007bff', borderRadius: 10, marginBottom: 10 }}>
        <Text style={{ fontSize: 18, color: 'white', textAlign: 'center' }}>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>Lugar del Baño:</Text>
      <ButtonGroup
        onPress={setSelectedIndex}
        selectedIndex={selectedIndex}
        buttons={places}
        containerStyle={{ marginBottom: 10 }}
      />

      <Button title={editingId ? "Actualizar Baño" : "Guardar Baño"} onPress={saveBath} buttonStyle={{ backgroundColor: '#28a745', borderRadius: 10, marginTop: 10 }} />

      <Button title="Borrar Todos los Baños" onPress={clearAllBaths} buttonStyle={{ backgroundColor: 'red', borderRadius: 10, marginTop: 10 }} />

      <FlatList
        data={baths}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, marginTop: 10, backgroundColor: '#f8f9fa', borderRadius: 10 }}>
            <Text style={{ fontSize: 16, flex: 1 }}>{new Date(item.date).toLocaleDateString()} - {item.place}</Text>
            <Icon name="edit" type="font-awesome" color="blue" onPress={() => { setEditingId(item.id); setDate(new Date(item.date)); setSelectedIndex(places.indexOf(item.place)); }} containerStyle={{ marginRight: 10 }} />
            <Icon name="trash" type="font-awesome" color="red" onPress={() => deleteBath(item.id)} />
          </View>
        )}
      />
    </View>
  );
};

export default MedicationsScreen;
