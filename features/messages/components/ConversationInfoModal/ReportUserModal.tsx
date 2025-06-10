import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const REPORT_REASONS = [
  { key: 'fake_profile', label: 'Fake Profile' },
  { key: 'inappropriate_content', label: 'Inappropriate Content' },
  { key: 'harassment', label: 'Harassment' },
  { key: 'other', label: 'Other' },
];

export interface ReportUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    reason: string;
    description: string;
    files?: ImagePicker.ImagePickerAsset[];
  }) => Promise<void>;
  isSubmitting: boolean;
  otherUserName: string;
}

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  otherUserName,
}) => {
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [assets, setAssets] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const pickImages = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') throw new Error('Permission not granted');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
        base64: false,
        exif: false,
      });

      if (!result.canceled && result.assets.length > 0) {
        const MAX = 5;
        const selected = result.assets.slice(0, MAX);
        if (result.assets.length > MAX) {
          Alert.alert(`Only ${MAX} images can be attached`);
        }
        setAssets((prev) => [...prev, ...selected]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Could not access library.');
    }
  }, []);

  const removeImage = (uri: string) => {
    setAssets((prev) => prev.filter((a) => a.uri !== uri));
  };

  const handleSubmit = useCallback(async () => {
    if (!reason) {
      Alert.alert('Please select a violation type.');
      return;
    }
    try {
      await onSubmit({ reason, description, files: assets });
      setReason('');
      setDescription('');
      setAssets([]);
    } catch (err) {
      console.error(err);
      Alert.alert('Submission failed, please try again.');
    }
  }, [reason, description, assets, onSubmit]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Report {otherUserName}</Text>

          <Text style={styles.label}>Violation Type</Text>
          <View style={styles.reasonList}>
            {REPORT_REASONS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.reasonButton,
                  reason === item.key && styles.reasonButtonSelected,
                ]}
                onPress={() => setReason(item.key)}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.reasonText,
                    reason === item.key && styles.reasonTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe the violation..."
            value={description}
            onChangeText={setDescription}
            multiline
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Proof Images (optional)</Text>
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}
          >
            {assets.map((asset) => (
              <View key={asset.uri} style={styles.previewWrapper}>
                <Image
                  source={{ uri: asset.uri }}
                  style={styles.imagePreview}
                />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeImage(asset.uri)}
                >
                  <Ionicons name="close-circle" size={20} color="#D32F2F" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={pickImages}
              disabled={isSubmitting}
            >
              <Ionicons name="image-outline" size={40} color="#aaa" />
              <Text style={styles.imagePickerText}>Add Images</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 4 },
  reasonList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  reasonButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginBottom: 8,
  },
  reasonButtonSelected: { backgroundColor: '#D32F2F', borderColor: '#D32F2F' },
  reasonText: { color: '#333' },
  reasonTextSelected: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  imagePicker: { alignItems: 'center', marginVertical: 8 },
  imagePickerText: { color: '#888', marginTop: 4 },
  previewWrapper: { marginRight: 8, marginBottom: 8, position: 'relative' },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },
  imagePreview: { width: 80, height: 80, borderRadius: 8 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  submitBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#D32F2F',
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelText: { color: '#333', fontWeight: '600' },
  submitText: { color: '#fff', fontWeight: '600' },
});
