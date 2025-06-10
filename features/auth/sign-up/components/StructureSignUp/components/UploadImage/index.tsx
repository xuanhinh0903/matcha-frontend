import * as ImagePicker from 'expo-image-picker';

import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { authActions, getAuthUser } from '@/store/global/auth/auth.slice';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/Button/matcha-button';
import { IStepSignUP } from '@/features/auth/sign-up/sign-up.type';
import { LinearGradient } from 'expo-linear-gradient';
import { UploadProgress } from '@/features/profile/components';
import { UserInfo } from '@/app/(auth)/not-verify-account';
import { showErrorToast } from '@/helpers/toast.helper';
import { styles } from './styles';
import { useUploadPhotosMutation } from '@/rtk-query';

interface UploadImageProps {
  setStep: React.Dispatch<React.SetStateAction<IStepSignUP | null>>;
  setUser: React.Dispatch<React.SetStateAction<UserInfo>>;
  user: UserInfo;
}

interface ImageAsset {
  uri: string;
  fileName?: string;
  fileSize?: number;
  height: number;
  width: number;
  mimeType?: string;
  type?: 'image' | 'video' | 'livePhoto' | 'pairedVideo';
}

const MAX_PHOTOS = 6;
const MIN_PHOTOS = 1;

export const UploadImage = ({ setStep, setUser, user }: UploadImageProps) => {
  const [images, setImages] = useState<(ImageAsset | null)[]>(
    Array(MAX_PHOTOS).fill(null)
  );
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [lastAddedTime, setLastAddedTime] = useState<number | null>(null);
  const dispatch = useDispatch();
  const [permission, requestPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const [uploadProgress, setUploadProgress] = useState<
    { current: number; total: number } | undefined
  >(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPhotos, { isLoading: isUploadingImages }] =
    useUploadPhotosMutation();
  const userAuth = useSelector(getAuthUser);

  // Only update parent state when images array changes
  useEffect(() => {
    // Update user state when images change
    const uploadedImages = images
      .filter((img): img is ImageAsset => img !== null)
      .map((img) => img.uri);

    // Only call setUser when uploadedImages actually changes
    if (JSON.stringify(user.photos) !== JSON.stringify(uploadedImages)) {
      setUser((prevUser: UserInfo) => ({
        ...prevUser,
        photos: uploadedImages,
      }));
    }
  }, [images, user.photos]);

  const pickImage = async (index: number) => {
    if (!permission?.granted) {
      const response = await requestPermission();
      if (!response.granted) {
        Alert.alert(
          'Permission required',
          'Please grant permission to access photos.'
        );
        return;
      }
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        const newImages = [...images];
        const asset = result.assets[0];
        newImages[index] = {
          uri: asset.uri,
          fileName: asset?.fileName || '',
          fileSize: asset.fileSize,
          height: asset.height,
          width: asset.width,
          mimeType: asset.mimeType,
          type: asset.type,
        };
        setImages(newImages);
        setLastAddedTime(Date.now());
      }
    } catch (error) {
      console.error('ImagePicker Error: ', error);
      Alert.alert('Error', 'Could not pick image.');
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const handleContinue = async () => {
    try {
      const formData = new FormData();
      const validImages = images.filter(
        (img): img is ImageAsset => img !== null
      );
      setIsUploading(true);
      setUploadProgress({ current: validImages?.length, total: 6 });
      // For multiple file uploads, we need to append each file with the same field name 'files'
      validImages.forEach((image, index) => {
        const fileName = image.fileName || `photo${index}.jpg`;
        formData.append('files', {
          uri: image.uri,
          type: image.mimeType || 'image/jpeg',
          name: fileName,
        } as any);
      });

      const response = await uploadPhotos(formData);
      if ('error' in response) {
        showErrorToast(response.error);
        setIsButtonDisabled(false);
        return;
      }

      setStep(IStepSignUP.WELL_COME_TO_MATCHA);
      dispatch(
        authActions.setAuthProfile({
          user: {
            ...userAuth,
            photos: response.data,
          },
        } as any)
      );
    } catch (error) {
      console.error('[Photo Upload Error]:', error);
      showErrorToast(error);
    } finally {
      setUploadProgress(undefined);
      setIsUploading(false);
    }
  };

  const uploadedCount = images.filter((img) => img !== null).length;
  const isButtonDisabledState = useMemo(
    () => uploadedCount < MIN_PHOTOS || isUploadingImages || isButtonDisabled,
    [uploadedCount, isUploadingImages, isButtonDisabled]
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Add photos</Text>
        <Text style={styles.description}>
          Add at least {MIN_PHOTOS} photos to continue
        </Text>
        <View style={styles.photoGrid}>
          {images.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={styles.photoSlot}
              onPress={() => !image && pickImage(index)}
              disabled={!!image}
            >
              {image ? (
                <>
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.photoImage}
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeButtonIcon}>×</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => pickImage(index)}
                >
                  <LinearGradient
                    colors={['#46ec62', '#35c848']}
                    style={styles.addButtonLinearGradient}
                  >
                    <Text key="add" style={styles.addButtonIcon}>
                      +
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={styles.continueButtonContainer}>
        <Button
          text="CONTINUE"
          onPress={handleContinue}
          isDisable={isButtonDisabledState}
        />
      </View>

      <UploadProgress
        visible={isUploading || !!uploadProgress}
        progress={uploadProgress}
      />
    </View>
  );
};
