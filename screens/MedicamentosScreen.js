import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const MedicamentosScreen = () => {
  const [medicamento, setMedicamento] = useState('');
  const [fechaTomado, setFechaTomado] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [duracion, setDuracion] = useState('');
  const [medicamentos, setMedicamentos] = useState([]);
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    cargarMedicamentos();
  }, []);

  const cargarMedicamentos = async () => {
    try {
      const data = await AsyncStorage.getItem('medicamentos');
      if (data) {
        setMedicamentos(JSON.parse(data));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const guardarMedicamento = async () => {
    if (!medicamento || !duracion) {
      alert('Por favor ingresa el nombre y la duración.');
      return;
    }

    const fechaTomadoObj = new Date(fechaTomado);
    const duracionDias = parseInt(duracion, 10);
    const fechaProxima = new Date(fechaTomadoObj);
    fechaProxima.setDate(fechaProxima.getDate() + duracionDias);

    let nuevosMedicamentos;
    if (editando !== null) {
      nuevosMedicamentos = medicamentos.map((item, index) =>
        index === editando
          ? { medicamento, fechaTomado: fechaTomadoObj.toISOString(), duracion, fechaProxima: fechaProxima.toISOString() }
          : item
      );
      setEditando(null);
    } else {
      nuevosMedicamentos = [...medicamentos, { medicamento, fechaTomado: fechaTomadoObj.toISOString(), duracion, fechaProxima: fechaProxima.toISOString() }];
    }

    setMedicamentos(nuevosMedicamentos);
    await AsyncStorage.setItem('medicamentos', JSON.stringify(nuevosMedicamentos));
    setMedicamento('');
    setFechaTomado(new Date());
    setDuracion('');
  };

  const eliminarMedicamento = async (index) => {
    const nuevosMedicamentos = medicamentos.filter((_, i) => i !== index);
    setMedicamentos(nuevosMedicamentos);
    await AsyncStorage.setItem('medicamentos', JSON.stringify(nuevosMedicamentos));
  };

  const editarMedicamento = (index) => {
    const med = medicamentos[index];
    setMedicamento(med.medicamento);
    setFechaTomado(new Date(med.fechaTomado));
    setDuracion(med.duracion);
    setEditando(index);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Agregar Medicamento</Text>

      {/* Nombre del Medicamento */}
      <TextInput
        placeholder="Nombre del medicamento"
        value={medicamento}
        onChangeText={setMedicamento}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 10 }}
      />

      {/* Selección de Fecha */}
      <TouchableOpacity
        onPress={() => setMostrarCalendario(true)}
        style={{ backgroundColor: '#007bff', padding: 10, borderRadius: 10, marginBottom: 10 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>📅 Fecha tomada: {fechaTomado.toDateString()}</Text>
      </TouchableOpacity>

      {mostrarCalendario && Platform.OS !== 'web' && (
        <DateTimePicker
          value={fechaTomado}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setMostrarCalendario(false);
            if (selectedDate) {
              setFechaTomado(selectedDate);
            }
          }}
        />
      )}

      {/* Para web, usamos un Input de tipo Date */}
      {Platform.OS === 'web' && (
        <TextInput
          type="date"
          value={fechaTomado.toISOString().split('T')[0]}
          onChangeText={(text) => setFechaTomado(new Date(text))}
          style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 10 }}
        />
      )}

      {/* Duración en días */}
      <TextInput
        placeholder="Duración en días"
        value={duracion}
        onChangeText={setDuracion}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 10 }}
      />

      {/* Botón de Guardar */}
      <TouchableOpacity
        onPress={guardarMedicamento}
        style={{
          backgroundColor: editando !== null ? 'orange' : '#28a745',
          padding: 10,
          borderRadius: 10,
          alignItems: 'center',
          marginBottom: 20,
        }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {editando !== null ? 'Actualizar' : 'Guardar'}
        </Text>
      </TouchableOpacity>

      {/* Lista de Medicamentos */}
      <FlatList
        data={medicamentos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8f9fa',
              padding: 10,
              borderRadius: 10,
              marginBottom: 10,
            }}>
            <View>
              <Text style={{ fontWeight: 'bold' }}>{item.medicamento}</Text>
              <Text>📅 Tomado: {new Date(item.fechaTomado).toDateString()}</Text>
              <Text>⏳ Próxima dosis: {new Date(item.fechaProxima).toDateString()}</Text>
            </View>

            {/* Botones de Editar y Eliminar */}
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => editarMedicamento(index)} style={{ marginRight: 10 }}>
                <Text style={{ color: 'blue', fontSize: 18 }}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => eliminarMedicamento(index)}>
                <Text style={{ color: 'red', fontSize: 18 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default MedicamentosScreen;
