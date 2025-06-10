import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { colors } from '../../styles';

// Matcha theme colors
const matchaColors = {
  primary: colors.primary,
  secondary: '#86A789',
  light: '#D2E3C8',
  extraLight: '#EBF3E8',
  text: '#2D3F2D',
  textLight: '#5F7161',
  border: '#B2C8B2',
  danger: colors.danger,
  white: '#FFFFFF',
  online: '#4CAF50',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TabNavigationProps {
  activeTab: 'info' | 'media';
  onTabChange: (tab: 'info' | 'media') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabIndicator = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate tab indicator to the selected tab when activeTab changes
    Animated.spring(tabIndicator, {
      toValue: activeTab === 'info' ? 0 : SCREEN_WIDTH / 2,
      tension: 80,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [activeTab, tabIndicator]);

  const switchTab = (tab: 'info' | 'media') => {
    onTabChange(tab);
  };

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'info' && styles.activeTab]}
        onPress={() => switchTab('info')}
        activeOpacity={0.6}
        testID="info-tab"
      >
        <Text
          style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}
        >
          Info
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'media' && styles.activeTab]}
        onPress={() => switchTab('media')}
        activeOpacity={0.6}
        testID="media-tab"
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'media' && styles.activeTabText,
          ]}
        >
          Media
        </Text>
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.tabIndicator,
          { transform: [{ translateX: tabIndicator }] },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: matchaColors.border,
    backgroundColor: matchaColors.white,
    width: '100%',
    zIndex: 5,
    position: 'relative',
  },
  tab: {
    flex: 0.5,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {},
  tabText: {
    fontSize: 16,
    color: matchaColors.textLight,
    textAlign: 'center',
  },
  activeTabText: {
    color: matchaColors.primary,
    fontWeight: 'bold',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH / 2,
    height: 3,
    backgroundColor: matchaColors.primary,
  },
});
