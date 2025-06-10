import React from 'react';
import { View, Text, Modal, ActivityIndicator } from 'react-native';
import { styles } from './styles';

export interface UploadProgressProps {
  visible: boolean;
  progress?: {
    current: number;
    total: number;
  };
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  visible,
  progress,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.text}>
            {progress
              ? `Uploading photo ${progress.current} of ${progress.total}...`
              : 'Preparing upload...'}
          </Text>
          {progress && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(progress.current / progress.total) * 100}%` },
                ]}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
