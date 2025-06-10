import * as ImagePicker from 'expo-image-picker';

import {
  AboutSection,
  FeaturesSection,
  PhotosSection,
  ProfileHeader,
  ProfileStats,
} from './sections';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EditProfileModal, UploadProgress } from './components';
import React, { useCallback, useEffect, useState } from 'react';
import { authActions, getAuthUser } from '@/store/global/auth/auth.slice';
import {
  useDeletePhotoMutation,
  useGetProfileQuery,
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
  useUploadPhotosMutation,
} from '@/rtk-query';
import { useDispatch, useSelector } from 'react-redux';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProfileFormData } from './interfaces';
import { getFilterInterests } from '@/store/global/discover/discover-filters.slice';
import { router } from 'expo-router';
import { showErrorToast } from '@/helpers/toast.helper';
import { styles } from './styles';

export const ProfileScreen = () => {
  const dispatch = useDispatch();
  const user = useSelector(getAuthUser);
  // Get filter interests from Redux store
  const filterInterests = useSelector(getFilterInterests);

  const { data, isLoading, error, refetch } = useGetProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Debug log to check if profile_thumbnail is in the API response
  useEffect(() => {
    console.log('Profile API Response:', data);
    console.log('Profile Thumbnail URL:', data?.profile_thumbnail);
  }, [data]);

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadPhotos, { isLoading: isUploading }] = useUploadPhotosMutation();
  const [deletePhoto, { isLoading: isDeleting }] = useDeletePhotoMutation();
  const [updateAvatar, { isLoading: isUpdatingAvatar }] =
    useUpdateAvatarMutation();
  const [uploadProgress, setUploadProgress] = useState<
    { current: number; total: number } | undefined
  >(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState<ProfileFormData>({
    full_name: '',
    phone_number: '',
    bio: '',
    gender: null,
    birthdate: undefined,
    interests: [],
  });
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await refetch().unwrap();
    } catch (error) {
      console.error('[Refresh Error]:', error);
      showErrorToast('Không thể làm mới dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Update form data when profile data changes
  useEffect(() => {
    if (data) {
      setEditForm({
        full_name: data.full_name || '',
        phone_number: data.phone_number || '',
        bio: data.bio || '',
        gender: data.gender,
        birthdate: data.birthdate,
        interests:
          data.interests?.map((interest) => interest.interest_id) || [],
        // User interests will be fetched by the EditProfileModal component
      });
    }
  }, [data]);

  const handleOpenEditModal = useCallback(() => {
    setIsEditModalVisible(true);
  }, []);

  const handleEditProfile = useCallback(
    async (formData: ProfileFormData) => {
      try {
        // Update user profile
        await updateProfile({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          bio: formData.bio,
          gender: formData.gender || undefined,
          birthdate: formData.birthdate,
        }).unwrap();

        // Refresh data after update
        await refetch();
      } catch (error) {
        console.error('[Edit Profile Error]:', error);
        throw error;
      }
    },
    [updateProfile, refetch]
  );

  // Function to add additional photos (multiple upload)
  const handleAddPhoto = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission not granted');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7, // Reduced quality to decrease file size
        allowsEditing: false,
        // Limit size and dimensions of images to prevent large uploads
        base64: false,
        exif: false,
      });

      if (!result.canceled && result.assets.length > 0) {
        // Limit number of files uploaded at once to prevent network issues
        const MAX_UPLOAD_COUNT = 5;
        const filesToUpload = result.assets.slice(0, MAX_UPLOAD_COUNT);

        setUploadProgress({ current: 0, total: filesToUpload.length });

        // Create FormData object once
        const formData = new FormData();

        // Add each file to the FormData with proper mime type detection
        filesToUpload.forEach((asset, index) => {
          const photoUri = asset.uri;
          const filename = photoUri.split('/').pop() || `photo${index}.jpg`;

          // Get mime type based on file extension
          const fileExtension =
            filename.split('.').pop()?.toLowerCase() || 'jpeg';
          const mimeType =
            fileExtension === 'png'
              ? 'image/png'
              : fileExtension === 'gif'
              ? 'image/gif'
              : 'image/jpeg';

          // Append to formData with proper typing
          formData.append('files', {
            uri: photoUri,
            type: mimeType,
            name: filename,
          } as any);

          // Update progress indicator
          setTimeout(() => {
            setUploadProgress((prev) =>
              prev ? { ...prev, current: index + 1 } : undefined
            );
          }, index * 300);
        });

        // If user selected more files than our limit, show a message
        if (result.assets.length > MAX_UPLOAD_COUNT) {
          showErrorToast(
            `Only ${MAX_UPLOAD_COUNT} images can be uploaded at once`
          );
        }

        try {
          await uploadPhotos(formData).unwrap();
          await refetch();
        } catch (uploadError) {
          console.error('[Photo Upload Error]:', uploadError);
          showErrorToast(
            'Failed to upload photos. Please try with fewer or smaller images.'
          );
          throw uploadError;
        }
      }
    } catch (error) {
      console.error('[Photo Upload Error]:', error);
      showErrorToast('Failed to upload photos');
    } finally {
      setUploadProgress(undefined);
    }
  }, [uploadPhotos, refetch]);

  // Function to update the user's avatar (single image upload)
  const handleChangeAvatar = useCallback(async () => {
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
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Process the first (and only) selected image
        const asset = result.assets[0];
        const photoUri = asset.uri;
        const filename = photoUri.split('/').pop() || 'photo.jpg';

        // Set progress to indicate single upload
        setUploadProgress({ current: 1, total: 1 });
        const formData = new FormData();
        formData.append('file', {
          uri: photoUri,
          type: 'image/jpeg',
          name: filename,
        } as any);

        const response = await updateAvatar(formData).unwrap();
        await refetch();
      }
    } catch (error) {
      console.error('[Avatar Update Error]:', error);
      throw error;
    } finally {
      setUploadProgress(undefined);
    }
  }, [updateAvatar, refetch]);

  const handleDeletePhoto = useCallback(async (photoId: number) => {
    setDeletingPhotoId(photoId);
    try {
      await deletePhoto(photoId).unwrap();
      await refetch();
    } catch (error) {
      console.error('[Delete Photo Error]:', error);
      showErrorToast('Failed to delete photo');
    } finally {
      setDeletingPhotoId(null);
    }
  }, [deletePhoto, refetch]);

  const handleLogout = useCallback(() => {
    dispatch(authActions.clear());
  }, [dispatch]);

  useEffect(() => {
    if (error && !data) {
      handleLogout();
    }
  }, [error, data]);
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!user) return null;

  console.log({ data });
  return (
    <View style={styles.container}>
      <UploadProgress
        visible={isUploading || isUpdatingAvatar || !!uploadProgress}
        progress={uploadProgress}
      />

      <ScrollView
        style={[styles.scrollContainer, { flex: 1 }]}
        contentContainerStyle={{ paddingVertical: 10 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
            title="Refreshing..."
            titleColor="#4CAF50"
            progressBackgroundColor="#fff"
          />
        }
      >
        <ProfileHeader
          fullName={data?.full_name || ''}
          birthdate={data?.birthdate}
          profilePicture={data?.profile_thumbnail || ''}
          onEditPress={handleChangeAvatar}
          onAvatarPress={handleChangeAvatar}
        />

        <ProfileStats isRefreshing={isRefreshing} />

        <AboutSection bio={data?.bio || ''} />

        <FeaturesSection onEditPress={handleOpenEditModal} />

        <PhotosSection
          isUploading={isUploading}
          onAddPhoto={handleAddPhoto}
          onDeletePhoto={handleDeletePhoto}
          isRefreshing={isRefreshing}
          isDeleting={isDeleting}
          deletingPhotoId={deletingPhotoId}
        />

        <View style={styles.logoutButton}>
          <TouchableOpacity
            style={[styles.featureRow, { backgroundColor: '#ffebee' }]}
            onPress={handleLogout}
          >
            <View style={[styles.featureIcon, { backgroundColor: '#ffcdd2' }]}>
              <MaterialCommunityIcons name="logout" size={24} color="#f44336" />
            </View>
            <Text style={[styles.featureText, { color: '#f44336' }]}>
              Logout
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#f44336"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <EditProfileModal
        visible={isEditModalVisible}
        isUpdating={isUpdating}
        initialData={editForm}
        onClose={() => setIsEditModalVisible(false)}
        onSave={handleEditProfile}
        filterInterests={filterInterests}
      />
    </View>
  );
};
