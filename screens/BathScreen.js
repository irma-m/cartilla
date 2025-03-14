import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from 'react-native';
import { RadioButton } from 'react-native-paper';

const BathScreen = () => {
    const [baths, setBaths] = useState([]);
    const [bathDate, setBathDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [location, setLocation] = useState('Casa');

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
            const newBaths = [...baths, { id: Date.now(), date: bathDate.toISOString().split('T')[0], location }];
            setBaths(newBaths);
            await AsyncStorage.setItem('baths', JSON.stringify(newBaths));
            Alert.alert('Guardado', 'Fecha de baño registrada correctamente.');
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

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Registrar Baño</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ padding: 10, backgroundColor: '#007bff', borderRadius: 10, marginBottom: 10 }}>
                <Text style={{ fontSize: 18, color: 'white', textAlign: 'center' }}>{bathDate.toISOString().split('T')[0]}</Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={bathDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setBathDate(selectedDate);
                    }}
                />
            )}

            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>Ubicación:</Text>
            <RadioButton.Group onValueChange={setLocation} value={location}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <RadioButton value="Casa" /><Text>Casa</Text>
                    <RadioButton value="Veterinaria" /><Text>Veterinaria</Text>
                    <RadioButton value="Petco" /><Text>Petco</Text>
                </View>
            </RadioButton.Group>

            <TouchableOpacity
                onPress={saveBath}
                style={{ backgroundColor: '#28a745', padding: 10, borderRadius: 10, alignItems: 'center', marginVertical: 10 }}
            >
                <Text style={{ color: 'white', fontSize: 18 }}>Guardar Baño</Text>
            </TouchableOpacity>

            <FlatList
                data={baths}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, marginTop: 10, backgroundColor: '#f8f9fa', borderRadius: 10 }}>
                        <Text style={{ fontSize: 16 }}>{item.date} - {item.location}</Text>
                        <TouchableOpacity
                            onPress={() => deleteBath(item.id)}
                            style={{ backgroundColor: 'red', padding: 10, borderRadius: 10 }}
                        >
                            <Text style={{ color: 'white', fontSize: 16 }}>Eliminar</Text>
                        </TouchableOpacity>

                    </View>
                )}
            />
        </View>
    );
};

export default BathScreen;
