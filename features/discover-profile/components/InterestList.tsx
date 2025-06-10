import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface InterestListProps {
  interests: string[];
}

const InterestList: React.FC<InterestListProps> = ({ interests }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Interests</Text>
      <View style={styles.interestsContainer}>
        {interests &&
          interests?.map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#222',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#ffebee', // Màu hồng nhạt giống Tinder
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20, // Bo góc mềm hơn
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#d32f2f', // Màu đỏ giống Tinder
    fontSize: 14,
    fontWeight: '500',
  },
});

export default InterestList;
