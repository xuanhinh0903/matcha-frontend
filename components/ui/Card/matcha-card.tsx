import React from 'react';
import { ImageBackground, Text, View, StyleSheet } from 'react-native';
import { CardStyles } from './styles';

export type TCardElement = {
  children: React.ReactNode;
  style?: Record<string, any>;
};

export type TDescription = TCardElement;
export const Description = ({ children }: TDescription) => {
  return <Text style={[CardStyles.description]}>{children}</Text>;
};

export type TTitle = TCardElement;
export const Title = ({ children }: TTitle) => {
  return <Text style={[CardStyles.title]}>{children}</Text>;
};

export type TInfo = TCardElement;
export const Info = ({ children, style }: TInfo) => {
  return <View style={[CardStyles.info, style]}>{children}</View>;
};

export type TCard = TCardElement & {
  profileImg?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  style?: any;
  overlayOpacity?: number;
};

export const Card = ({
  children,
  profileImg,
  minHeight = 100,
  maxHeight,
  minWidth,
  style,
  overlayOpacity = 0.1,
}: TCard) => {
  const cardStyles = StyleSheet.flatten([
    CardStyles.card,
    {
      minHeight,
      maxHeight,
      minWidth,
    },
    style,
  ]);

  return (
    <View style={cardStyles}>
      <ImageBackground
        style={CardStyles.cover}
        source={{
          uri: profileImg,
        }}
        resizeMode="cover"
      >
        {/* Overlay */}
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
            width: '100%',
          }}
        />
        <View style={CardStyles.coverContainer}>{children}</View>
      </ImageBackground>
    </View>
  );
};

Card.Title = Title;
Card.Description = Description;
Card.Info = Info;
