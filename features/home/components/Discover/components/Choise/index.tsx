import { View, Text } from 'react-native';
import React, { FC } from 'react';
import { ChoiseStyleSheet } from './styles';

const COLORS = {
  like: '#46ec62', // Matcha green for like
  nope: '#ff4b4b', // Red for nope
};

const LABELS = {
  like: 'LIKE',
  nope: 'NOPE',
};

export interface IChoise {
  type: 'like' | 'nope';
}

const Choice: FC<IChoise> = ({ type }) => {
  const color = COLORS[type];

  return (
    <View
      style={[
        ChoiseStyleSheet.wrapper,
        {
          borderColor: color,
          backgroundColor: 'transparent',
          transform: [{ rotate: type === 'like' ? '-15deg' : '15deg' }],
          right: type === 'like' ? null : 40,
          left: type === 'like' ? 40 : null,
        },
      ]}
    >
      <Text
        style={[
          ChoiseStyleSheet.label,
          {
            color: color,
          },
        ]}
      >
        {LABELS[type]}
      </Text>
    </View>
  );
};

export default Choice;
