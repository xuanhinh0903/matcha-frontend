import React from 'react';
import { Image, Text, View } from 'react-native';
import { UnavailableUsersStyleSheet } from './styles';
import { ScrollView } from 'react-native-gesture-handler';

export const UnavailableUsers = () => {
  return (
    <View style={[UnavailableUsersStyleSheet.wrapper]}>
      <Text style={UnavailableUsersStyleSheet.text}>
        We couldn't find any users for you right now
      </Text>
      <Image
        style={UnavailableUsersStyleSheet.image}
        source={{
          uri: 'https://cdn3d.iconscout.com/3d/premium/thumb/empty-box-6219421-5102419.png',
        }}
      />
    </View>
  );
};
