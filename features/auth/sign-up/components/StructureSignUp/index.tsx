import { Image, TouchableOpacity, View } from 'react-native';

import React from 'react';
import { Styles } from './styles';

interface StructureSignUpProps {
  children: React.ReactNode;
  handleBackButton?: () => void;
  isBackButton?: boolean;
}

export const StructureSignUp = ({ 
  children, 
  handleBackButton,
  isBackButton = true
}: StructureSignUpProps) => {

 

  return (
    <View style={Styles.container}>
      {children}
      {
        handleBackButton && !isBackButton && <TouchableOpacity style={Styles.arrowLeft} onPress={handleBackButton}>
        <Image
          source={require('@/assets/icon/arrow-left.png')}
          style={Styles.logoArrowLeft}
        />
      </TouchableOpacity>
      }
     
    </View>
  );
};
