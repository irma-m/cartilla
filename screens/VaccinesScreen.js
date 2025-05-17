import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Icon, ButtonGroup } from 'react-native-elements';
import * as Notifications from 'expo-notifications';

const VaccinesScreen = () => {
    const [vaccines, setVaccines] = useState([]);
    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date());
    const [duration, setDuration] = useState('');
    const [weight, setWeight] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const vaccineTypes = ['Virus', 'Bacteriana', 'Refuerzo'];
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadVaccines();
    }, []);

    const loadVaccines = async () => {
        try {
            const storedVaccines = await AsyncStorage.getItem('vaccines');
            if (storedVaccines) setVaccines(JSON.parse(storedVaccines));
        } catch (error) {
            console.error('Error loading vaccines:', error);
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
    

    const saveVaccine = async () => {
        try {
            if (!name || !duration || !weight) {
                Alert.alert('Error', 'Por favor, completa todos los campos.');
                return;
            }
    
            const nextDate = new Date(date);
            nextDate.setMonth(nextDate.getMonth() + parseInt(duration));
    
            const newVaccine = {
                id: Date.now(),
                name,
                date: date.toISOString().split('T')[0],
                nextDate: nextDate.toISOString().split('T')[0],
                duration,
                type: vaccineTypes[selectedIndex],
                weight,
            };
    
            const updatedVaccines = [...vaccines, newVaccine];
            setVaccines(updatedVaccines);
            await AsyncStorage.setItem('vaccines', JSON.stringify(updatedVaccines));
    
            // Programar notificación
            await scheduleNotification(
                "Recordatorio de Vacuna",
                `Recuerda aplicar la vacuna de ${name}`,
                nextDate
            );
    
            Alert.alert("Guardado", "Vacuna registrada y recordatorio programado.");
            setName('');
            setDuration('');
            setWeight('');
        } catch (error) {
            console.error("Error al guardar vacuna:", error);
        }
    };
    
  
    const deleteVaccine = async (id) => {
        try {
            const updatedVaccines = vaccines.filter(vaccine => vaccine.id !== id);
            setVaccines(updatedVaccines);
            await AsyncStorage.setItem('vaccines', JSON.stringify(updatedVaccines));
        } catch (error) {
            console.error('Error deleting vaccine:', error);
        }
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
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Registrar Vacuna</Text>

            <TextInput placeholder="Nombre de la vacuna" value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 10 }} />

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

            <TextInput placeholder="Duración (meses)" keyboardType="numeric" value={duration} onChangeText={setDuration} style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 10 }} />
            <TextInput placeholder="Peso (kg)" keyboardType="numeric" value={weight} onChangeText={setWeight} style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 10 }} />

            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>Tipo de Vacuna:</Text>
            <ButtonGroup onPress={setSelectedIndex} selectedIndex={selectedIndex} buttons={vaccineTypes} containerStyle={{ marginBottom: 10 }} />

            <Button title={editingId ? "Actualizar Vacuna" : "Guardar Vacuna"} onPress={saveVaccine} buttonStyle={{ backgroundColor: '#28a745', borderRadius: 10, marginTop: 10 }} />

            <FlatList
                data={vaccines}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, marginTop: 10, backgroundColor: '#f8f9fa', borderRadius: 10 }}>
                        <Text style={{ fontSize: 16, flex: 1 }}>{item.name} - {new Date(item.date).toLocaleDateString()} (Próxima: {new Date(item.nextDate).toLocaleDateString()}) - {item.type} - {item.weight} kg</Text>
                        <Icon name="edit" type="font-awesome" color="blue" onPress={() => { setEditingId(item.id); setName(item.name); setDate(new Date(item.date)); setDuration(item.duration); setSelectedIndex(vaccineTypes.indexOf(item.type)); setWeight(item.weight); }} containerStyle={{ marginRight: 10 }} />
                        <Icon name="trash" type="font-awesome" color="red" onPress={() => deleteVaccine(item.id)} />
                    </View>
                )}
            />
        </View>
    );
};

export default VaccinesScreen;
