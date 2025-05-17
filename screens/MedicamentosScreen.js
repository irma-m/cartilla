import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from 'react-native-elements';
import * as Notifications from 'expo-notifications';

const MedicationsScreen = () => {
  const [medications, setMedications] = useState([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [duration, setDuration] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadMedications(),  
    requestNotificationPermissions();
  }, []);

  const loadMedications = async () => {
    try {
      const storedMedications = await AsyncStorage.getItem('medications');
      if (storedMedications) setMedications(JSON.parse(storedMedications));
    } catch (error) {
      console.error('Error loading medications:', error);
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


    const saveMedication = async () => {
      try {
          if (!name || !duration) {
              Alert.alert('Error', 'Por favor, completa todos los campos.');
              return;
          }
  
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + parseInt(duration));
  
          const newMedicine = {
              id: Date.now(),
              name,
              date: date.toISOString().split('T')[0],
              nextDate: nextDate.toISOString().split('T')[0],
              duration,
          };
  
          const updatedMedications = [...medications, newMedicine];
          setMedications(updatedMedications);
          await AsyncStorage.setItem('medications', JSON.stringify(updatedMedications));
  
          // Programar notificación
          await scheduleNotification(
              "Recordatorio de Medicamento",
              `Recuerda administrar ${name}`,
              nextDate
          );
  
          Alert.alert("Guardado", "Medicamento registrado y recordatorio programado.");
          setName('');
          setDuration('');
      } catch (error) {
          console.error("Error al guardar medicamento:", error);
      }
  };
  

  const deleteMedication = async (id) => {
    try {
      const updatedMedications = medications.filter(medication => medication.id !== id);
      setMedications(updatedMedications);
      await AsyncStorage.setItem('medications', JSON.stringify(updatedMedications));
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  };

  const editMedication = (medication) => {
    setName(medication.name);
    setDate(new Date(medication.date));
    setDuration(medication.duration);
    setEditingId(medication.id);
  };

  const scheduleNotification = async (title, body, date) => {
    await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: { seconds: Math.max(0, (date.getTime() - Date.now()) / 1000) },
    });
};

 
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Registrar Medicamento</Text>
      
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
      
      <Button title={editingId ? "Actualizar Medicamento" : "Guardar Medicamento"} onPress={saveMedication} buttonStyle={{ backgroundColor: '#28a745', borderRadius: 10, marginTop: 10 }} />
      
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, marginTop: 10, backgroundColor: '#f8f9fa', borderRadius: 10 }}>
            <Text style={{ fontSize: 16, flex: 1 }}>{item.name} - {new Date(item.date).toLocaleDateString()} - {item.duration} días - Próx: {item.nextDate}</Text>
            <Button title="✏️" onPress={() => editMedication(item)} buttonStyle={{ backgroundColor: 'blue', borderRadius: 10, marginRight: 5 }} />
            <Button title="🗑️" onPress={() => deleteMedication(item.id)} buttonStyle={{ backgroundColor: 'red', borderRadius: 10 }} />
          </View>
        )}
      />
    </View>
  );
};



export default MedicationsScreen;
