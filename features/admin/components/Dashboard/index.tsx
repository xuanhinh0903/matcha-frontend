import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  authActions,
  getAuthUser,
  isUserAdmin,
} from '@/store/global/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '@/store/global';
import {
  useGetReportsQuery,
  useResolveReportMutation,
} from '@/rtk-query/admin/reportApi';

import BanDurationModal from '../BanDurationModal';
import { Ionicons } from '@expo/vector-icons';
import { Report } from '@/api/types';
import { useRouter } from 'expo-router';

// Matcha theme colors
const COLORS = {
  primary: '#7CB342', // Matcha green
  secondary: '#4A6741', // Dark matcha
  accent: '#FF4B4B', // Pink accent
  background: '#F7F9F0', // Light cream bg
  cardBg: '#FFFFFF', // White card background
  text: {
    primary: '#2D3B29', // Dark green text
    secondary: '#5D6D56', // Medium green text
    light: '#7E8C78', // Light green text
  },
  status: {
    pending: '#FFCA28', // Amber yellow
    resolved: '#66BB6A', // Light green
  },
  divider: '#E8EFE1', // Light green divider
};

// Format date string
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Convert report_reason from snake_case to Title Case
const formatReportReason = (reason: string) => {
  return reason
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>(
    undefined
  );
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const user = useAppSelector(getAuthUser);
  const isAdmin = useAppSelector(isUserAdmin);

  // RTK Query hooks
  const {
    data: reports,
    isLoading,
    refetch,
  } = useGetReportsQuery(selectedFilter);

  useEffect(() => {
    // Check if user is admin, if not redirect to home
    if (user && !isAdmin) {
      router.replace('/(tabs)');
    }
  }, [user, isAdmin, router]);

  const handleFilterChange = (filter?: string) => {
    setSelectedFilter(filter);
  };

  const handleReportPress = (report: Report) => {
    setSelectedReport(report);
    setShowDetail(true);
  };

  const handleBackPress = () => {
    setShowDetail(false);
    setSelectedReport(null);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout Confirmation',
      'Are you sure you want to logout from admin dashboard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            // Clear auth state using the proper action
            dispatch(authActions.logout());
            // Redirect to login page
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const renderReportItem = ({ item }: { item: Report }) => (
    <TouchableOpacity
      style={styles.reportItem}
      onPress={() => handleReportPress(item)}
    >
      <View style={styles.reportHeader}>
        <Text style={styles.reportType}>
          {formatReportReason(item.report_reason)}
        </Text>
        <Text
          style={[
            styles.statusBadge,
            item.status === 'pending'
              ? styles.pendingBadge
              : styles.resolvedBadge,
          ]}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
      <View style={styles.reportContent}>
        <Text style={styles.reportedUser}>
          User: {item.reported.username} (ID: {item.reported.user_id})
        </Text>
        <Text style={styles.reportDate}>
          Reported: {formatDate(item.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4B4B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!showDetail ? (
        <>
          <View style={styles.dashboardHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={18} color="white" />
              </View>
              <Text style={styles.dashboardTitle}>Admin Dashboard</Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <View style={styles.logoutButtonContent}>
                  <Ionicons name="log-out-outline" size={18} color="white" />
                  <Text style={styles.logoutText}>Logout</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statusIndicator}>
            <Text style={styles.statusLabel}>
              {selectedFilter
                ? `${
                    selectedFilter.charAt(0).toUpperCase() +
                    selectedFilter.slice(1)
                  } Reports`
                : 'All Reports'}
            </Text>
            {reports && <Text style={styles.countBadge}>{reports.length}</Text>}

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => refetch()}
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color={COLORS.text.primary}
              />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterChips}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === undefined && styles.activeFilterChip,
              ]}
              onPress={() => handleFilterChange(undefined)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === undefined && styles.activeFilterChipText,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === 'pending' && styles.activeFilterChip,
              ]}
              onPress={() => handleFilterChange('pending')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === 'pending' && styles.activeFilterChipText,
                ]}
              >
                Pending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === 'closed' && styles.activeFilterChip,
              ]}
              onPress={() => handleFilterChange('closed')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === 'closed' && styles.activeFilterChipText,
                ]}
              >
                Resolved
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF4B4B" />
            </View>
          ) : reports && reports.length > 0 ? (
            <FlatList
              data={reports}
              renderItem={renderReportItem}
              keyExtractor={(item) => item.report_id.toString()}
              style={styles.reportList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No reports found</Text>
            </View>
          )}
        </>
      ) : (
        selectedReport && (
          <ReportDetail
            report={selectedReport}
            onBack={handleBackPress}
            onResolveComplete={() => {
              handleBackPress();
              refetch();
            }}
          />
        )
      )}
    </SafeAreaView>
  );
}

interface ReportDetailProps {
  report: Report;
  onBack: () => void;
  onResolveComplete: () => void;
}

function ReportDetail({
  report,
  onBack,
  onResolveComplete,
}: ReportDetailProps) {
  const [banModalVisible, setBanModalVisible] = useState(false);
  const [resolveReport, { isLoading: isResolving }] =
    useResolveReportMutation();

  const handleResolve = async (action: string) => {
    if (action === 'ban') {
      setBanModalVisible(true);
    } else {
      try {
        await resolveReport({
          reportId: report.report_id,
          data: { action: action === 'delete' ? 'delete' : 'ignore' },
        }).unwrap();
        Alert.alert(
          'Success',
          `Report has been resolved with action: ${action}`,
          [{ text: 'OK', onPress: onResolveComplete }]
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to resolve the report. Please try again.');
      }
    }
  };

  const handleConfirmBan = async (duration: number, reason: string) => {
    setBanModalVisible(false);
    try {
      await resolveReport({
        reportId: report.report_id,
        data: {
          action: 'ban',
          banDays: duration,
          reason,
        },
      }).unwrap();
      Alert.alert(
        'Success',
        `User ${report.reported.full_name} has been banned for ${duration} days`,
        [{ text: 'OK', onPress: onResolveComplete }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to ban the user. Please try again.');
    }
  };

  const handleDeleteConfirmation = () => {
    Alert.alert(
      'Confirm Account Deletion',
      `Are you sure you want to permanently delete the account of user ${report.reported.full_name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => handleResolve('delete'),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView>

    <View style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FF4B4B" />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Report Details</Text>
      </View>

      <View style={styles.detailContent}>
        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={styles.detailValue}>
            {formatReportReason(report.report_reason)}
          </Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Status:</Text>
          <Text
            style={[
              styles.detailValue,
              report.status === 'pending'
                ? styles.pendingText
                : styles.resolvedText,
            ]}
          >
            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Reported User:</Text>
          <Text style={styles.detailValue}>
            {report.reported.username} (ID: {report.reported.user_id})
          </Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Date Reported:</Text>
          <Text style={styles.detailValue}>
            {formatDate(report.created_at)}
          </Text>
        </View>

        {report.details && (
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Details:</Text>
            <Text style={styles.detailValue}>{report.details}</Text>
          </View>
        )}

        {report.images && report.images.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Evidence Images:</Text>
            <ScrollView horizontal style={styles.imageGallery}>
              {report.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image.thumbnail_url }}
                  style={styles.evidenceImage}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {report.status === 'pending' && (
        <View style={styles.actionContainer}>
          <Text style={styles.actionTitle}>Take Action</Text>

          <TouchableOpacity
            style={[styles.actionButton, styles.ignoreButton]}
            onPress={() => handleResolve('ignore')}
            disabled={isResolving}
          >
            <Text style={styles.actionButtonText}>Ignore Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.temporaryBanButton]}
            onPress={() => handleResolve('ban')}
            disabled={isResolving}
          >
            <Text style={styles.actionButtonText}>Temporary Ban</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteConfirmation}
            disabled={isResolving}
          >
            <Text style={styles.actionButtonText}>Delete Account</Text>
          </TouchableOpacity>

          {isResolving && (
            <ActivityIndicator
              style={styles.actionLoader}
              size="small"
              color="#FF4B4B"
            />
          )}
        </View>
      )}

      <BanDurationModal
        isVisible={banModalVisible}
        onClose={() => setBanModalVisible(false)}
        onConfirm={handleConfirmBan}
      />
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminBadge: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    color: 'white',
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  refreshText: {
    color: COLORS.text.primary,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBg,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.divider,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: 'white',
    fontWeight: '600',
  },
  reportList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  reportItem: {
    padding: 16,
    backgroundColor: COLORS.cardBg,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportType: {
    fontWeight: '700',
    fontSize: 16,
    color: COLORS.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
    textAlign: 'center',
  },
  pendingBadge: {
    backgroundColor: COLORS.status.pending,
    color: COLORS.text.primary,
  },
  resolvedBadge: {
    backgroundColor: COLORS.status.resolved,
    color: 'white',
  },
  reportContent: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  reportedUser: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
    color: COLORS.text.light,
  },
  detailContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: COLORS.background,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(124, 179, 66, 0.1)',
    borderRadius: 20,
    marginRight: 12,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  detailContent: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  pendingText: {
    color: COLORS.status.pending,
    fontWeight: '700',
  },
  resolvedText: {
    color: COLORS.status.resolved,
    fontWeight: '700',
  },
  actionContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: COLORS.text.primary,
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ignoreButton: {
    backgroundColor: '#9E9E9E',
  },
  temporaryBanButton: {
    backgroundColor: COLORS.secondary,
  },
  deleteButton: {
    backgroundColor: COLORS.accent,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  actionLoader: {
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  imageGallery: {
    flexDirection: 'row',
    marginTop: 10,
  },
  evidenceImage: {
    width: 120,
    height: 120,
    marginRight: 10,
    borderRadius: 8,
  },
});
