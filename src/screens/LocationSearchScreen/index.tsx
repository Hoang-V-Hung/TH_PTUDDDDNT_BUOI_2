import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackgroundView } from '../../components/BackgroundView';
import { GlassCard } from '../../components/GlassCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocationSearch } from '../../hooks';
import { LocationItem } from '../../types';

export const LocationSearchScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    recentLocations,
    popularLocations,
    currentLocation,
    handleSelectLocation,
    handleSelectGps,
    handleClearRecent,
    clearQuery,
    navigation,
  } = useLocationSearch();

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;
  const safeTop = Math.max(insets.top, statusBarHeight) + 8;
  const safeBottom = Math.max(insets.bottom, 16) + 20;

  return (
    <BackgroundView>
      <View style={[styles.container, { paddingTop: safeTop, paddingBottom: safeBottom }]}>
        {/* Search Bar Header */}
        <View style={styles.headerRow}>
          <View style={styles.searchBarWrapper}>
            <Icon name="search" size={18} color="rgba(255, 255, 255, 0.6)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm thành phố..."
              placeholderTextColor="rgba(255, 255, 255, 0.45)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              selectionColor="#38BDF8"
              returnKeyType="search"
            />
            {isLoading ? (
              <ActivityIndicator size="small" color="#38BDF8" style={styles.clearBtn} />
            ) : searchQuery.length > 0 ? (
              <TouchableOpacity onPress={clearQuery} style={styles.clearBtn} activeOpacity={0.7}>
                <Icon name="close-circle" size={18} color="rgba(255, 255, 255, 0.6)" />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {searchQuery.trim().length >= 2 ? (
            /* Kết quả tìm kiếm thời gian thực */
            <View style={styles.section}>
              <Text style={styles.sectionHeaderTitle}>KẾT QUẢ TÌM KIẾM</Text>
              {searchResults.length > 0 ? (
                <GlassCard style={styles.resultsCard}>
                  {searchResults.map((item, index) => {
                    const isCurrent =
                      currentLocation.lat.toFixed(2) === item.lat.toFixed(2) &&
                      currentLocation.lon.toFixed(2) === item.lon.toFixed(2);

                    return (
                      <View key={item.id ? `${item.id}-${index}` : index.toString()}>
                        <TouchableOpacity
                          style={styles.resultItemRow}
                          onPress={() => handleSelectLocation(item)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.locationPinWrapper}>
                            <Icon name="location-sharp" size={20} color="#38BDF8" />
                          </View>
                          <View style={styles.resultItemInfo}>
                            <View style={styles.nameWithBadge}>
                              <Text style={styles.cityNameText}>{item.name}</Text>
                              {isCurrent && (
                                <View style={styles.currentBadge}>
                                  <Text style={styles.currentBadgeText}>Đang chọn</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.regionText}>
                              {[item.admin1, item.country].filter(Boolean).join(', ')}
                            </Text>
                          </View>
                          <Icon name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.4)" />
                        </TouchableOpacity>
                        {index < searchResults.length - 1 && (
                          <View style={[styles.itemDivider, { backgroundColor: colors.borderColor }]} />
                        )}
                      </View>
                    );
                  })}
                </GlassCard>
              ) : !isLoading ? (
                <View style={styles.emptyContainer}>
                  <Icon name="search-outline" size={48} color="rgba(255, 255, 255, 0.3)" style={{ marginBottom: 12 }} />
                  <Text style={styles.emptyTitle}>Không tìm thấy địa điểm</Text>
                  <Text style={styles.emptyDesc}>
                    Không có kết quả phù hợp cho "{searchQuery}". Vui lòng thử từ khóa khác.
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            /* Màn hình mặc định: Vị trí GPS + Gần đây + Phổ biến */
            <>
              {/* Card Vị trí GPS hiện tại */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSelectGps}
                style={{ marginBottom: 18 }}
              >
                <GlassCard style={styles.gpsCard}>
                  <View style={styles.gpsRow}>
                    <View style={styles.gpsIconCircle}>
                      <Icon name="navigate" size={20} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.gpsTitle}>Vị trí của tôi (GPS)</Text>
                        {currentLocation.isGps && (
                          <View style={styles.activeGpsPill}>
                            <View style={styles.greenDot} />
                            <Text style={styles.activeGpsText}>Đang dùng</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.gpsSubtitle}>
                        Tự động định vị thời tiết theo tọa độ hiện tại
                      </Text>
                    </View>
                    <Icon name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.4)" />
                  </View>
                </GlassCard>
              </TouchableOpacity>

              {/* Danh sách tìm kiếm gần đây */}
              {recentLocations.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionHeaderTitle}>GẦN ĐÂY</Text>
                    <TouchableOpacity onPress={handleClearRecent} activeOpacity={0.6}>
                      <Text style={styles.clearRecentBtnText}>Xóa tất cả</Text>
                    </TouchableOpacity>
                  </View>
                  <GlassCard style={styles.resultsCard}>
                    {recentLocations.map((item, index) => (
                      <View key={item.id ? `recent-${item.id}-${index}` : index.toString()}>
                        <TouchableOpacity
                          style={styles.resultItemRow}
                          onPress={() => handleSelectLocation(item)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.locationPinWrapper}>
                            <Icon name="time-outline" size={18} color="rgba(255, 255, 255, 0.7)" />
                          </View>
                          <View style={styles.resultItemInfo}>
                            <Text style={styles.cityNameText}>{item.name}</Text>
                            <Text style={styles.regionText}>
                              {[item.admin1, item.country].filter(Boolean).join(', ')}
                            </Text>
                          </View>
                          <Icon name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.4)" />
                        </TouchableOpacity>
                        {index < recentLocations.length - 1 && (
                          <View style={[styles.itemDivider, { backgroundColor: colors.borderColor }]} />
                        )}
                      </View>
                    ))}
                  </GlassCard>
                </View>
              )}

              {/* Các thành phố phổ biến */}
              <View style={styles.section}>
                <Text style={styles.sectionHeaderTitle}>THÀNH PHỐ PHỔ BIẾN</Text>
                <View style={styles.popularGrid}>
                  {popularLocations.map((item) => {
                    const isSelected =
                      currentLocation.lat.toFixed(2) === item.lat.toFixed(2) &&
                      currentLocation.lon.toFixed(2) === item.lon.toFixed(2);

                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.7}
                        onPress={() => handleSelectLocation(item)}
                        style={[
                          styles.popularPill,
                          isSelected && styles.popularPillActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.popularPillText,
                            isSelected && styles.popularPillTextActive,
                          ]}
                        >
                          {item.name}
                        </Text>
                        {isSelected && (
                          <Icon name="checkmark" size={14} color="#38BDF8" style={{ marginLeft: 4 }} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </BackgroundView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 14,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
    marginLeft: 6,
  },
  cancelBtn: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 16,
    color: '#38BDF8',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  gpsCard: {
    padding: 16,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  gpsSubtitle: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.70)',
    marginTop: 2,
  },
  activeGpsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 8,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
    marginRight: 4,
  },
  activeGpsText: {
    fontSize: 11,
    color: '#4ADE80',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: 8,
    marginLeft: 4,
  },
  clearRecentBtnText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  resultsCard: {
    paddingVertical: 4,
  },
  resultItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  locationPinWrapper: {
    width: 28,
    alignItems: 'center',
    marginRight: 10,
  },
  resultItemInfo: {
    flex: 1,
  },
  nameWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  currentBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    color: '#38BDF8',
    fontWeight: '600',
  },
  regionText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 2,
  },
  itemDivider: {
    height: 0.5,
    marginLeft: 52,
    marginRight: 14,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  popularPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    margin: 4,
  },
  popularPillActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderColor: '#38BDF8',
  },
  popularPillText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  popularPillTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
