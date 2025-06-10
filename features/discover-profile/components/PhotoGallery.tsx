import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';

interface PhotoGalleryProps {
  photos: string[];
}

const { width, height } = Dimensions.get('window');
const mainPhotoSize = width * 0.9;
const smallPhotoSize = (width - 48) / 2;

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openGallery = (index: number) => {
    setSelectedIndex(index);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Ảnh đại diện lớn */}
      {photos.length > 0 && (
        <TouchableOpacity onPress={() => openGallery(0)}>
          <Image source={{ uri: photos[0] }} style={styles.mainPhoto} />
        </TouchableOpacity>
      )}

      {/* Hai ảnh nhỏ bên dưới */}
      <View style={styles.smallPhotoContainer}>
        {photos.slice(1, 3).map((photo, index) => (
          <TouchableOpacity key={index} onPress={() => openGallery(index + 1)}>
            <Image source={{ uri: photo }} style={styles.smallPhoto} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal xem danh sách ảnh */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            keyExtractor={(item, index) => index.toString()}
            initialScrollIndex={selectedIndex}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.fullScreenPhoto} />
            )}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/463/463612.png',
              }}
              style={styles.closeIcon}
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainPhoto: {
    width: mainPhotoSize,
    height: mainPhotoSize * 1.2,
    borderRadius: 20,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  smallPhotoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  smallPhoto: {
    width: smallPhotoSize,
    height: smallPhotoSize * 1.2,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenPhoto: {
    width: width,
    height: height,
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  closeIcon: {
    width: 30,
    height: 30,
  },
});

export default PhotoGallery;
