import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';
import { FeatureRow } from '../../components/FeatureRow';
import { useRouter } from 'expo-router';
import { PrivacySettingsModal } from '../../components/PrivacySettingsModal';
import { PrivacySettings } from '../../interfaces';
import { useSavePrivacySettingsMutation } from '@/rtk-query';
import { showErrorToast, showSuccessToast } from '@/helpers/toast.helper';

export interface FeaturesSectionProps {
  onEditPress: () => void;
}

type Feature = {
  icon: string;
  label: string;
  color: string;
  backgroundColor: string;
  onPress?: () => void;
};

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  onEditPress,
}) => {
  const router = useRouter();
  const [savePrivacySettings, { isLoading: isSaving }] =
    useSavePrivacySettingsMutation();

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    photos: 'public',
    bio: 'public',
    age: 'matches',
    interests: 'public',
    // matchStats: 'private',
  });

  const handleSavePrivacy = async (settings: PrivacySettings) => {
    try {
      await savePrivacySettings(settings).unwrap();
      setPrivacySettings(settings);
      showSuccessToast('Privacy settings updated successfully');
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      showErrorToast('Failed to update privacy settings');
    }
  };

  const features: Feature[] = [
    {
      icon: 'account-cog',
      label: 'Account Settings',
      color: '#4CAF50',
      backgroundColor: '#e8f5e9',
      onPress: onEditPress,
    },
    {
      icon: 'shield-lock',
      label: 'Privacy',
      color: '#2196F3',
      backgroundColor: '#e3f2fd',
      onPress: () => setShowPrivacyModal(true),
    },
    {
      icon: 'report',
      label: 'Your reports',
      color: '#FF9800',
      backgroundColor: '#fff3e0',
      onPress: () => {
        router.push('/(report)');
      },
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Features</Text>
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <React.Fragment key={feature.label}>
            {index > 0 && <View style={styles.divider} />}
            <FeatureRow {...feature} />
          </React.Fragment>
        ))}
      </View>
      <PrivacySettingsModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        settings={privacySettings}
        onSave={handleSavePrivacy}
        isLoading={isSaving}
      />
    </View>
  );
};
