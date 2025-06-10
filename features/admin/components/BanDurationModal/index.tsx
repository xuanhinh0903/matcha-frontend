import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Matcha theme colors (matching the Dashboard component)
const COLORS = {
  primary: '#7CB342', // Matcha green
  secondary: '#4A6741', // Dark matcha
  accent: '#FF4B4B', // Pink accent
  background: '#F7F9F0', // Light cream bg
  cardBg: '#FFFFFF', // White card background
  text: {
    primary: '#2D3B29', // Dark green text
    secondary: '#5D6D56', // Medium green text
    light: '#7E8C78', // Light green text
  },
  divider: '#E8EFE1', // Light green divider
};

interface BanDurationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (duration: number, reason: string) => void;
}

export default function BanDurationModal({
  isVisible,
  onClose,
  onConfirm,
}: BanDurationModalProps) {
  const [duration, setDuration] = useState(7); // Default is 7 days
  const [reason, setReason] = useState('');

  const durationOptions = [1, 3, 7, 14, 30, 90];

  const handleConfirm = () => {
    onConfirm(duration, reason);
    setDuration(7); // Reset to default
    setReason('');
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Temporary Ban</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={20}
                    color={COLORS.text.primary}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Ban Duration (Days)</Text>
              <View style={styles.durationOptions}>
                {durationOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.durationOption,
                      duration === option && styles.selectedDuration,
                    ]}
                    onPress={() => setDuration(option)}
                  >
                    <Text
                      style={[
                        styles.durationText,
                        duration === option && styles.selectedDurationText,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Ban Reason</Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="Enter reason for banning this user"
                placeholderTextColor={COLORS.text.light}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
              />

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmButtonText}>Confirm Ban</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: 6,
    backgroundColor: COLORS.divider,
    borderRadius: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 10,
    marginTop: 4,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  durationOption: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 10,
    padding: 10,
    margin: 4,
    minWidth: 45,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  selectedDuration: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  durationText: {
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  selectedDurationText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    textAlignVertical: 'top',
    backgroundColor: COLORS.background,
    color: COLORS.text.primary,
    fontSize: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginLeft: 12,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: COLORS.secondary,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
