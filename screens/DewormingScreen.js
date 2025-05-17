import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from 'react-native-elements';
import { RadioButton } from 'react-native-paper';
import * as Notifications from 'expo-notifications';

const DewormingScreen = () => {
  const [dewormings, setDewormings] = useState([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [duration, setDuration] = useState('');
  const [weight, setWeight] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState('Interna');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadDewormings(), 
    requestNotificationPermissions();
  }, []);

  const loadDewormings = async () => {
    try {
      const storedDewormings = await AsyncStorage.getItem('dewormings');
      if (storedDewormings) setDewormings(JSON.parse(storedDewormings));
    } catch (error) {
      console.error('Error loading dewormings:', error);
    }
  };

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        alert('No se otorgaron permisos para notificaciones.');
        return false;
    }
    return true;
};

  const calculateNextDate = (startDate, days) => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + parseInt(days, 10));
    return newDate.toISOString().split('T')[0];
  };

  const saveDeworming = async () => {
    try {
        if (!name || !duration) {
            Alert.alert('Error', 'Por favor, completa todos los campos.');
            return;
        }

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + parseInt(duration));

        const newDeworming = {
            id: Date.now(),
            name,
            date: date.toISOString().split('T')[0],
            nextDate: nextDate.toISOString().split('T')[0],
            duration,
        };

        const updatedDewormings = [...dewormings, newDeworming];
        setDewormings(updatedDewormings);
        await AsyncStorage.setItem('dewormings', JSON.stringify(updatedDewormings));

        // Programar notificación
        await scheduleNotification(
            "Recordatorio de Desparasitación",
            `Recuerda administrar ${name}`,
            nextDate
        );

        Alert.alert("Guardado", "Desparasitación registrada y recordatorio programado.");
        setName('');
        setDuration('');
    } catch (error) {
        console.error("Error al guardar desparasitación:", error);
    }
};


  const deleteDeworming = async (id) => {
    try {
      const updatedDewormings = dewormings.filter(deworming => deworming.id !== id);
      setDewormings(updatedDewormings);
      await AsyncStorage.setItem('dewormings', JSON.stringify(updatedDewormings));
    } catch (error) {
      console.error('Error deleting deworming:', error);
    }
  };

  const editDeworming = (deworming) => {
    setName(deworming.name);
    setDate(new Date(deworming.date));
    setDuration(deworming.duration);
    setWeight(deworming.weight);
    setType(deworming.type);
    setEditingId(deworming.id);
  };

    const scheduleNotification = async (title, body, date) => {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) return;
    
        await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
                sound: true,
            },
            trigger: { date: new Date(date) }, // Fecha programada
        });
    };
    
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Registrar Desparasitación</Text>
      
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>Nombre del Medicamento:</Text>
      <TextInput value={name} onChangeText={setName} style={{ borderBottomWidth: 1, marginBottom: 10, fontSize: 16 }} />
      
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>Fecha de Aplicación:</Text>
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
      
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>Duración (días):</Text>
      <TextInput value={duration} onChangeText={setDuration} keyboardType="numeric" style={{ borderBottomWidth: 1, marginBottom: 10, fontSize: 16 }} />
      
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>Peso (kg):</Text>
      <TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" style={{ borderBottomWidth: 1, marginBottom: 10, fontSize: 16 }} />
      
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>Tipo de Desparasitación:</Text>
      <RadioButton.Group onValueChange={setType} value={type}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <RadioButton value="Interna" /><Text>Interna</Text>
          <RadioButton value="Externa" /><Text>Externa</Text>
        </View>
      </RadioButton.Group>
      
      <Button title={editingId ? "Actualizar Desparasitación" : "Guardar Desparasitación"} onPress={saveDeworming} buttonStyle={{ backgroundColor: '#28a745', borderRadius: 10, marginTop: 10 }} />
      
      <FlatList
        data={dewormings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, marginTop: 10, backgroundColor: '#f8f9fa', borderRadius: 10 }}>
            <Text style={{ fontSize: 16, flex: 1 }}>{item.name} - {new Date(item.date).toLocaleDateString()} - {item.type} - {item.duration} días - {item.weight} kg - Próx: {item.nextDate}</Text>
            <Button title="✏️" onPress={() => editDeworming(item)} buttonStyle={{ backgroundColor: 'blue', borderRadius: 10, marginRight: 5 }} />
            <Button title="🗑️" onPress={() => deleteDeworming(item.id)} buttonStyle={{ backgroundColor: 'red', borderRadius: 10 }} />
          </View>
        )}
      />
    </View>
  );
};

export default DewormingScreen;
