import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useUserSubmittedReports, UserReport } from '@/api/reports';

const fallbackImage =
  'https://via.placeholder.com/200x300?text=Image+not+found';

const ReportListScreen: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const router = useRouter();

  // Fetch reports using our API with filtering and sorting
  const {
    data: reports,
    isLoading,
    isError,
    error,
    refetch,
  } = useUserSubmittedReports({
    filter: selectedType !== 'All' ? selectedType : undefined,
    sortOrder,
  });

  // Handle selection of a report
  const handleSelectReport = (report: UserReport) => {
    setSelectedReport(report);
  };

  // Handle image loading errors
  const handleImageError = (index: number, item: UserReport) => {
    // Use fallback image if loading fails
    console.log(
      `Image loading error for report ${item.id}, image index ${index}`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Close */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {!selectedReport ? (
          <>
            <Text style={styles.title}>Reported Issues</Text>

            {/* Filter / Sort Row */}
            <View style={styles.topControls}>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(true)}
                style={styles.filterIcon}
              >
                <Ionicons name="filter" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                  setSortOrder(newOrder);
                }}
                style={styles.sortButton}
              >
                <Text style={styles.sortText}>
                  {sortOrder === 'asc' ? 'Date ↑' : 'Date ↓'}
                </Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2EEB70" />
                <Text style={styles.loadingText}>Loading reports...</Text>
              </View>
            ) : isError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Error loading reports. Please try again.
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => refetch()}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : reports && reports.length > 0 ? (
              <FlatList
                data={reports}
                keyExtractor={(i) => i.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectReport(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.card}>
                      <Text style={styles.type}>{item.type}</Text>
                      <Text style={styles.dateText}>
                        Reported: {item.dateReported}
                      </Text>
                      <Text style={styles.userInfo}>
                        User:{' '}
                        <Text style={styles.userId}>
                          {item.reportedUser.username}
                        </Text>{' '}
                        (ID: {item.reportedUser.id})
                      </Text>
                      <Text style={styles.content} numberOfLines={2}>
                        {item.content}
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.imageRow}
                      >
                        {item.images && item.images.length > 0 ? (
                          item.images.map((uri, idx) => (
                            <Image
                              key={idx}
                              source={{ uri }}
                              style={styles.image}
                              onError={() => handleImageError(idx, item)}
                            />
                          ))
                        ) : (
                          <Text style={styles.noImagesText}>No images</Text>
                        )}
                      </ScrollView>
                      <Text
                        style={[
                          styles.status,
                          item.status === 'Resolved'
                            ? styles.resolved
                            : styles.pending,
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                onRefresh={refetch}
                refreshing={isLoading}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  You haven't submitted any reports yet.
                </Text>
              </View>
            )}

            {/* Filter Modal */}
            <Modal
              visible={filterModalVisible}
              transparent
              animationType="fade"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modal}>
                  <Text style={styles.modalTitle}>Filter by Type</Text>
                  <Picker
                    selectedValue={selectedType}
                    onValueChange={(e) => {
                      setSelectedType(e);
                      setFilterModalVisible(false);
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="All" value="All" />
                    <Picker.Item label="Harassment" value="Harassment" />
                    <Picker.Item
                      label="Inappropriate Content"
                      value="Inappropriate Content"
                    />
                    <Picker.Item label="Spam" value="Spam" />
                    <Picker.Item label="Fake Profile" value="Fake Profile" />
                    <Picker.Item label="Other" value="Other" />
                  </Picker>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <ScrollView contentContainerStyle={styles.detailContainer}>
            <Text style={styles.modalType}>{selectedReport.type}</Text>
            <Text style={styles.modalStatus}>
              Status:{' '}
              <Text
                style={
                  selectedReport.status === 'Resolved'
                    ? styles.resolved
                    : styles.pending
                }
              >
                {selectedReport.status}
              </Text>
            </Text>
            <Text style={styles.userInfo}>
              User:{' '}
              <Text style={styles.userId}>
                {selectedReport.reportedUser.username}
              </Text>{' '}
              (ID: {selectedReport.reportedUser.id})
            </Text>
            <Text style={styles.dateText}>
              Reported: {selectedReport.dateReported}
            </Text>
            {selectedReport.dateResolved && (
              <Text style={styles.dateText}>
                Resolved: {selectedReport.dateResolved}
              </Text>
            )}
            <Text style={styles.modalContent}>{selectedReport.content}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageRow}
            >
              {selectedReport.images && selectedReport.images.length > 0 ? (
                selectedReport.images.map((uri, idx) => (
                  <Image
                    key={idx}
                    source={{ uri }}
                    style={styles.modalImage}
                    onError={() => handleImageError(idx, selectedReport)}
                  />
                ))
              ) : (
                <Text style={styles.noImagesText}>No images provided</Text>
              )}
            </ScrollView>
            {selectedReport.adminFeedback && (
              <View style={styles.feedbackBox}>
                <Text style={styles.feedbackTitle}>Admin Feedback</Text>
                <Text style={styles.feedbackText}>
                  {selectedReport.adminFeedback}
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => setSelectedReport(null)}
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  closeText: {
    fontSize: 18,
    color: '#2D2D2D',
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  filterIcon: {
    backgroundColor: '#2EEB70',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2EEB70',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  sortButton: {
    backgroundColor: '#2EEB70',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#2EEB70',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  sortText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  list: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  type: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2EEB70',
    marginBottom: 8,
  },
  userInfo: {
    fontSize: 15,
    color: '#666',
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userId: {
    fontWeight: '600',
    color: '#1A1A1A',
  },
  dateText: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  content: {
    fontSize: 15,
    color: '#2D2D2D',
    marginVertical: 12,
    lineHeight: 22,
  },
  imageRow: {
    marginTop: 12,
  },
  image: {
    width: 120,
    height: 180,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  status: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  resolved: {
    color: '#fff',
    backgroundColor: '#2EEB70',
  },
  pending: {
    color: '#fff',
    backgroundColor: '#F59E0B',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end', // Changed to bottom sheet style
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  picker: {
    width: '100%',
    marginBottom: 16,
  },
  detailContainer: {
    padding: 20,
  },
  modalType: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  modalStatus: {
    fontSize: 16,
    marginVertical: 12,
    color: '#666',
  },
  modalContent: {
    fontSize: 16,
    color: '#2D2D2D',
    marginVertical: 16,
    lineHeight: 24,
  },
  modalImage: {
    width: 200,
    height: 300,
    marginRight: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  feedbackBox: {
    backgroundColor: '#F8F9FB',
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  feedbackTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  backButton: {
    marginTop: 24,
    backgroundColor: '#2EEB70',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#2EEB70',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  backText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#2EEB70',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  noImagesText: {
    fontSize: 14,
    color: '#888',
    marginTop: 12,
  },
});
export default ReportListScreen;
