import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { styles } from './styles';
import { PrivacyLevel, PrivacySettings } from '../../interfaces';

interface PrivacySettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: PrivacySettings;
  onSave: (settings: PrivacySettings) => Promise<void>;
  isLoading?: boolean;
}

const privacyOptions: { label: string; value: PrivacyLevel }[] = [
  { label: 'Only me', value: 'private' },
  { label: 'Matches only', value: 'matches' },
  { label: 'Public', value: 'public' },
];

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  visible,
  onClose,
  settings,
  onSave,
  isLoading = false,
}) => {
  const [localSettings, setLocalSettings] =
    React.useState<PrivacySettings>(settings);

  // Reset local settings when modal opens
  React.useEffect(() => {
    if (visible) {
      setLocalSettings(settings);
    }
  }, [visible, settings]);

  const handleSave = async () => {
    try {
      await onSave(localSettings);
      // Closing is handled by the parent component
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Privacy Settings</Text>
          <ScrollView style={styles.content}>
            {Object.entries(localSettings).map(([key, value]) => (
              <View key={key} style={styles.settingItem}>
                <Text style={styles.settingLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={value}
                    onValueChange={(itemValue: PrivacyLevel) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        [key]: itemValue,
                      }))
                    }
                    style={styles.picker}
                    enabled={!isLoading}
                  >
                    {privacyOptions.map((option) => (
                      <Picker.Item
                        key={option.value}
                        label={option.label}
                        value={option.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
