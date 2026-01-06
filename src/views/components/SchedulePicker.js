// Schedule Picker Component
// Component to select multiple days and times for class schedule

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const DAYS_OF_WEEK = [
  { id: 0, name: 'Domingo', short: 'Dom' },
  { id: 1, name: 'Lunes', short: 'Lun' },
  { id: 2, name: 'Martes', short: 'Mar' },
  { id: 3, name: 'Miércoles', short: 'Mié' },
  { id: 4, name: 'Jueves', short: 'Jue' },
  { id: 5, name: 'Viernes', short: 'Vie' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
];

export const SchedulePicker = ({ schedules, onChange, theme }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeType, setTimeType] = useState('start'); // 'start' or 'end'
  const [tempSchedule, setTempSchedule] = useState({
    day: null,
    startTime: new Date(),
    endTime: new Date(),
  });

  const addSchedule = () => {
    if (schedules.length >= 5) {
      alert('Máximo 5 horarios permitidos');
      return;
    }
    setEditingIndex(null);
    setTempSchedule({
      day: null,
      startTime: new Date(2024, 0, 1, 18, 0), // Default 18:00
      endTime: new Date(2024, 0, 1, 20, 0), // Default 20:00
    });
    setShowModal(true);
  };

  const saveSchedule = () => {
    if (tempSchedule.day === null) {
      alert('Selecciona un día');
      return;
    }

    const newSchedules = [...schedules];
    if (editingIndex !== null) {
      newSchedules[editingIndex] = tempSchedule;
    } else {
      newSchedules.push(tempSchedule);
    }
    onChange(newSchedules);
    setShowModal(false);
  };

  const removeSchedule = (index) => {
    const newSchedules = schedules.filter((_, i) => i !== index);
    onChange(newSchedules);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatScheduleText = () => {
    if (schedules.length === 0) return 'Agregar horarios';
    return schedules.map(s => 
      `${DAYS_OF_WEEK[s.day].short} ${formatTime(s.startTime)}-${formatTime(s.endTime)}`
    ).join(', ');
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.scheduleButton(theme)}
        onPress={addSchedule}
      >
        <Text style={styles.scheduleButtonText(theme)} numberOfLines={2}>
          {formatScheduleText()}
        </Text>
        <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
      </TouchableOpacity>

      {schedules.length > 0 && (
        <View style={styles.scheduleList}>
          {schedules.map((schedule, index) => (
            <View key={index} style={styles.scheduleItem(theme)}>
              <View style={styles.scheduleItemContent}>
                <Text style={styles.scheduleDay(theme)}>
                  {DAYS_OF_WEEK[schedule.day].name}
                </Text>
                <Text style={styles.scheduleTime(theme)}>
                  {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeSchedule(index)}>
                <Ionicons name="close-circle" size={24} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Modal for adding/editing schedule */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent(theme)}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle(theme)}>Agregar Horario</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Day Selection */}
              <Text style={styles.modalLabel(theme)}>Día de la semana</Text>
              <View style={styles.daysGrid}>
                {DAYS_OF_WEEK.map((day) => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.dayButton(theme),
                      tempSchedule.day === day.id && styles.dayButtonActive(theme),
                    ]}
                    onPress={() => setTempSchedule({ ...tempSchedule, day: day.id })}
                  >
                    <Text
                      style={[
                        styles.dayButtonText(theme),
                        tempSchedule.day === day.id && styles.dayButtonTextActive(theme),
                      ]}
                    >
                      {day.short}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Time Selection */}
              <Text style={styles.modalLabel(theme)}>Horario</Text>
              <View style={styles.timeRow}>
                <TouchableOpacity
                  style={styles.timeButton(theme)}
                  onPress={() => {
                    setTimeType('start');
                    setShowTimePicker(true);
                  }}
                >
                  <Text style={styles.timeLabel(theme)}>Inicio</Text>
                  <Text style={styles.timeValue(theme)}>
                    {formatTime(tempSchedule.startTime)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.timeButton(theme)}
                  onPress={() => {
                    setTimeType('end');
                    setShowTimePicker(true);
                  }}
                >
                  <Text style={styles.timeLabel(theme)}>Fin</Text>
                  <Text style={styles.timeValue(theme)}>
                    {formatTime(tempSchedule.endTime)}
                  </Text>
                </TouchableOpacity>
              </View>

              {showTimePicker && (
                <DateTimePicker
                  value={timeType === 'start' ? tempSchedule.startTime : tempSchedule.endTime}
                  mode="time"
                  is24Hour={true}
                  display="spinner"
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) {
                      setTempSchedule({
                        ...tempSchedule,
                        [timeType === 'start' ? 'startTime' : 'endTime']: selectedTime,
                      });
                    }
                  }}
                />
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton(theme)}
              onPress={saveSchedule}
            >
              <Text style={styles.saveButtonText(theme)}>Guardar Horario</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = {
  scheduleButton: (theme) => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  }),
  scheduleButtonText: (theme) => ({
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginRight: 8,
  }),
  scheduleList: {
    marginTop: 12,
    gap: 8,
  },
  scheduleItem: (theme) => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 8,
    padding: 12,
  }),
  scheduleItemContent: {
    flex: 1,
  },
  scheduleDay: (theme) => ({
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  }),
  scheduleTime: (theme) => ({
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  }),
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: (theme) => ({
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  }),
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: (theme) => ({
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  }),
  modalBody: {
    padding: 20,
  },
  modalLabel: (theme) => ({
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  }),
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  dayButton: (theme) => ({
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  dayButtonActive: (theme) => ({
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  }),
  dayButtonText: (theme) => ({
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  }),
  dayButtonTextActive: (theme) => ({
    color: theme.colors.card,
  }),
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  timeButton: (theme) => ({
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  }),
  timeLabel: (theme) => ({
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  }),
  timeValue: (theme) => ({
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  }),
  saveButton: (theme) => ({
    backgroundColor: theme.colors.primary,
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  }),
  saveButtonText: (theme) => ({
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.card,
  }),
};
