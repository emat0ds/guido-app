import { useState, useRef, useCallback, useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

import HomeScreen from './index';
import ProgressiScreen from './progressi';
import BadgeScreen from './badge';
import ProfiloScreen from './profilo';
import EsameScreen from './esame';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type TabScreenProps = { refreshKey?: number };

const TAB_DEFINITIONS: { key: string; label: string; component: React.ComponentType<TabScreenProps> }[] = [
  { key: 'home', label: 'Home', component: HomeScreen },
  { key: 'progressi', label: 'Progressi', component: ProgressiScreen },
  { key: 'badge', label: 'Badge', component: BadgeScreen },
  { key: 'profilo', label: 'Profilo', component: ProfiloScreen },
  { key: 'esame', label: 'Esame', component: EsameScreen },
];

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Fires when user navigates back from lezione/ripasso/etc.
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((k) => k + 1);
    }, [])
  );

  const goToTab = useCallback((index: number) => {
    setActiveTab(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveTab(viewableItems[0].index);
      }
    }
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      paddingBottom: insets.bottom,
      height: 56 + insets.bottom,
    }),
    [colors, insets.bottom]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        ref={flatListRef}
        data={TAB_DEFINITIONS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.key}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => {
          const Screen = item.component;
          return (
            <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
              <Screen refreshKey={refreshKey} />
            </View>
          );
        }}
        style={{ flex: 1 }}
      />
      <View style={[styles.tabBar, tabBarStyle]}>
        {TAB_DEFINITIONS.map((tab, index) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => goToTab(index)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === index ? colors.purple : '#666666' },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
});
