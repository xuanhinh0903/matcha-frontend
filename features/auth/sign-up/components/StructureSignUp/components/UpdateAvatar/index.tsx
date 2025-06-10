import * as ImagePicker from 'expo-image-picker';

import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useGetProfileQuery, useUpdateAvatarMutation } from "@/rtk-query";

import { Button } from '@/components/ui/Button/matcha-button';
import { IStepSignUP } from "@/features/auth/sign-up/sign-up.type";
import { UploadProgress } from '@/features/profile/components';
import { UserInfo } from '@/app/(auth)/not-verify-account';
import { authActions } from '@/store/global/auth';
import { getAuthUser } from '@/store/global/auth/auth.slice';
import { isValid } from 'date-fns';
import { showErrorToast } from '@/helpers/toast.helper';

interface UpdateAvatarProps {
  profilePicture?: string;
  setStep: (step: IStepSignUP) => void;
  setUser: (user: UserInfo) => void;
  user: UserInfo;
}

export const UpdateAvatar = ({ profilePicture, setStep, setUser, user }: UpdateAvatarProps) => {
  const [updateAvatar, { isLoading: isUpdatingAvatar }] = useUpdateAvatarMutation();
  const { refetch } = useGetProfileQuery();
  const dispatch = useDispatch();
  const userAuth = useSelector(getAuthUser);
  const [uploadProgress, setUploadProgress] = useState<
    { current: number; total: number } | undefined
  >(undefined);
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    filename: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  // Function to pick image
  const handlePickImage = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission not granted');
      }
  
      // Allow only a single image selection
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Process the first (and only) selected image
        const asset = result.assets[0];
        const photoUri = asset.uri;
        const filename = photoUri.split('/').pop() || 'photo.jpg';
  
        // Store selected image for preview
        setSelectedImage({
          uri: photoUri,
          filename: filename,
        });
        
        // Enable button immediately after selecting image
        setButtonDisabled(false);
      }
    } catch (error) {
      console.error('[Image Selection Error]:', error);
      showErrorToast('Failed to select image');
    }
  }, []);

  // Function to upload the selected image
  const handleUploadImage = useCallback(async () => {
    if (!selectedImage) {
      showErrorToast('Please select an image first');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress({ current: 1, total: 1 });
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: selectedImage.filename,
      } as any);

      const response = await updateAvatar(formData).unwrap();
      if ('error' in response) {
        showErrorToast(response.error);
        return;
      }
      setStep(IStepSignUP.INTERESTS);
      dispatch(
        authActions.setAuthProfile({
          user: {
            ...userAuth,
            profile_thumbnail: response.photo_url_thumbnail,
          },
        } as any)
      );
    } catch (error) {
      console.error('[Avatar Upload Error]:', error);
      showErrorToast('Failed to upload image');
    } finally {
      setUploadProgress(undefined);
      setIsUploading(false);
    }
  }, [selectedImage, updateAvatar, refetch, user, setStep, setUser]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Profile Picture</Text>
      <Text style={styles.description}>
        Select a photo that represents you best. A good profile picture increases your chances of making meaningful connections.
      </Text>
      
      <View style={styles.avatarWrapper}>
        <TouchableOpacity onPress={handlePickImage} disabled={isUploading || isUpdatingAvatar}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                selectedImage
                  ? { uri: selectedImage.uri }
                  : profilePicture
                    ? { uri: profilePicture }
                    : require('@/assets/images/icon.png')
              }
              style={styles.avatar}
            />
            {(isUpdatingAvatar || isUploading) && (
              <View style={styles.uploadingOverlay}>
                {/* Loading overlay */}
              </View>
            )}
          </View>
          <View style={styles.pickImageButton}>
            <Text style={styles.pickImageText}>Choose Image</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleUploadImage}
        disabled={isUploading || isUpdatingAvatar || (!selectedImage && !profilePicture)}
      >
        <Button
          text="Update Profile Picture"
          onPress={handleUploadImage}
          isLoading={false}
          isDisable={isUploading || isUpdatingAvatar || (!selectedImage && !profilePicture)}
        />
      </TouchableOpacity>

      <UploadProgress
        visible={isUploading || isUpdatingAvatar || !!uploadProgress}
        progress={uploadProgress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 22,
  },
  avatarWrapper: {
    marginBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickImageButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  pickImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  updateButton: {
    marginTop: 20,
    width: 'auto',
  },
  disabledButton: {
    backgroundColor: '#A8A8A8',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});