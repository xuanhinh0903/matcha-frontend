import React, { useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles as sectionStyles } from './styles';
import { styles as profileStyles } from '../../styles';
import { StatItem } from '../../components/StatItem';
import { router } from 'expo-router';
import { useGetProfileStatsQuery } from '@/rtk-query';

interface SkeletonStatItemProps {
  color: string;
  backgroundColor: string;
}

const SkeletonStatItem: React.FC<SkeletonStatItemProps> = ({
  color,
  backgroundColor,
}) => (
  <View style={profileStyles.statItem}>
    <View
      style={[profileStyles.featureIcon, { backgroundColor, marginBottom: 8 }]}
    >
      <ActivityIndicator size="small" color={color} />
    </View>
    <View style={[sectionStyles.skeleton, sectionStyles.skeletonValue]} />
    <View style={[sectionStyles.skeleton, sectionStyles.skeletonLabel]} />
  </View>
);

interface ProfileStatsProps {
  isRefreshing: boolean;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ isRefreshing }) => {
  const { data, refetch, isLoading } = useGetProfileStatsQuery();

  const handleNavigateToLikes = () => {
    // Navigate to likes screen showing "Who liked you"
    router.push('/likes');
  };

  useEffect(() => {
    if (isRefreshing) {
      refetch();
    }
  }, [isRefreshing]);

  return (
    <View style={sectionStyles.container}>
      <View style={sectionStyles.statsContainer}>
        {isLoading ? (
          <View style={sectionStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
          </View>
        ) : (
          <>
            <StatItem
              icon="heart-multiple"
              value={data?.matchStats?.totalMatches.toString() || '0'}
              label="Matches"
              color="#4CAF50"
              backgroundColor="#e8f5e9"
            />
            <TouchableOpacity onPress={handleNavigateToLikes}>
              <StatItem
                icon="thumb-up"
                value={data?.matchStats?.likesReceived.toString() || '0'}
                label="Likes"
                color="#FF9800"
                backgroundColor="#fff3e0"
              />
            </TouchableOpacity>
            <StatItem
              icon="percent"
              value={`${data?.matchStats?.matchRate || '0'}%`}
              label="Match Rate"
              color="#2196F3"
              backgroundColor="#e3f2fd"
            />
          </>
        )}
      </View>
    </View>
  );
};
