import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { Avatar } from '@/features';

import { useAppSelector } from '../../store/global';
import { HeaderStylesheet } from './header.styles';

export interface IHeader {
  gotoProfile: () => void;
}
export const Header = ({ gotoProfile }: IHeader) => {
  const auth: any = useAppSelector((state) => state.auth);
  const profileImg = auth?.user?.profileImg || '';
  return (
    <View style={HeaderStylesheet.container}>
      <View>
        <Text style={HeaderStylesheet.logoText}>MATCHA</Text>
      </View>
      <View>
        <TouchableOpacity onPress={gotoProfile}>
          <Avatar imageUrl={profileImg as string} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
