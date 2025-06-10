import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function Avatar({ uri }: { uri: string }) {
  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 350, // Kích thước lớn hơn
    height: 450, // Giống với ảnh trên Tinder
    borderRadius: 20, // Bo góc nhẹ thay vì hình tròn
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10, // Hiệu ứng đổ bóng cho Android
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Hiển thị full ảnh
  },
});
