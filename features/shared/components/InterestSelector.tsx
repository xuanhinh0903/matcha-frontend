import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface Interest {
  interest_id: number;
  interest_name: string;
}

interface InterestSelectorProps {
  interests?: Interest[];
  selectedInterests: number[];
  onToggleInterest: (interestId: number) => void;
  isLoading?: boolean;
  containerStyle?: any;
  highlightedInterests?: number[];
  disabled?: boolean;
}

// Memoized single interest item to prevent unnecessary re-renders
const InterestItem = memo(
  ({
    interest,
    isSelected,
    isHighlighted,
    onToggle,
    disabled,
  }: {
    interest: Interest;
    isSelected: boolean;
    isHighlighted: boolean;
    onToggle: () => void;
    disabled: boolean;
  }) => {
    // Only use LinearGradient for selected items to improve performance
    if (isSelected) {
      return (
        <TouchableOpacity
          onPress={onToggle}
          disabled={disabled}
          activeOpacity={disabled ? 1 : 0.7}
          style={disabled ? { opacity: 0.6 } : undefined}
        >
          <LinearGradient
            colors={['#46ec62', '#35c848']}
            style={[
              styles.interestItem,
              styles.interestItemSelected,
              isHighlighted && styles.interestItemHighlighted,
            ]}
          >
            <Text
              style={[
                styles.interestText,
                styles.interestTextSelected,
                isHighlighted && styles.interestTextHighlighted,
              ]}
            >
              {interest.interest_name}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    // Use plain View for non-selected items (much faster than LinearGradient)
    return (
      <TouchableOpacity
        onPress={onToggle}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.7}
        style={disabled ? { opacity: 0.6 } : undefined}
      >
        <View
          style={[
            styles.interestItem,
            isHighlighted && styles.interestItemHighlighted,
          ]}
        >
          <Text
            style={[
              styles.interestText,
              isHighlighted && styles.interestTextHighlighted,
            ]}
          >
            {interest.interest_name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
);

// Create the InterestSelector component first, then memoize it
const InterestSelectorComponent = ({
  interests = [],
  selectedInterests = [],
  onToggleInterest,
  isLoading = false,
  containerStyle,
  highlightedInterests = [],
  disabled = false,
}: InterestSelectorProps) => {
  if (isLoading) {
    return <ActivityIndicator size="large" color="#46ec62" />;
  }

  return (
    <View style={[styles.interestsContainer, containerStyle]}>
      {interests?.map((interest) => (
        <InterestItem
          key={interest.interest_id}
          interest={interest}
          isSelected={selectedInterests.includes(interest.interest_id)}
          isHighlighted={highlightedInterests.includes(interest.interest_id)}
          onToggle={() => onToggleInterest(interest.interest_id)}
          disabled={disabled}
        />
      ))}
    </View>
  );
};

// Create a memoized version as a named export
export const InterestSelector = memo(InterestSelectorComponent);

const styles = StyleSheet.create({
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestItem: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginRight: 8,
  },
  interestItemSelected: {
    borderColor: 'transparent',
  },
  interestItemHighlighted: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  interestText: {
    fontSize: 14,
    color: '#666',
  },
  interestTextSelected: {
    color: '#fff',
  },
  interestTextHighlighted: {
    color: '#4CAF50',
  },
});

// Export the memoized component as default export
export default memo(InterestSelectorComponent);
