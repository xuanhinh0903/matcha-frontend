import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const ScreenLoader = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#46ec62" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default ScreenLoader;
