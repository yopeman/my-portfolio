/* eslint-disable react-hooks/immutability, react-hooks/refs -- Reanimated shared values are
   mutable by design: worklets below run on the UI thread and write to `.value` directly, which
   the React Compiler lint rules cannot model. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

const INITIAL_URL = 'https://vectoradvert.com/erp/hr/#/ceo-dashboard';
const MAX_PULL = 120; // How many pixels to pull for a full 360° rotation

export type WebViewScreenProps = {
  /** Called by the Android hardware back button when there is no history to go back to. */
  onClose?: () => void;
};

export function WebViewScreen({ onClose }: WebViewScreenProps) {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true); // Controls whether the pull gesture is enabled
  const isAtTopRef = useRef(true); // Stable ref to avoid stale closures in onScroll

  // --- Reanimated shared values ---
  const translateY = useSharedValue(0); // How far the indicator is pulled down
  const rotation = useSharedValue(0); // Rotation angle (0 to 360)
  const isRefreshing = useSharedValue(false);

  // --- Navigation ---
  const handleBack = useCallback(() => {
    if (canGoBack) {
      webViewRef.current?.goBack();
      return;
    }
    if (onClose) {
      onClose();
      return;
    }
    // Single-page app: nothing to go back to, so exit the app.
    BackHandler.exitApp();
  }, [canGoBack, onClose]);

  const reload = useCallback(() => {
    webViewRef.current?.reload();
  }, []);

  // --- Android hardware back ---
  const onAndroidBackPress = useCallback(() => {
    handleBack();
    return true;
  }, [handleBack]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const sub = BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
      return () => sub.remove();
    }
  }, [onAndroidBackPress]);

  // --- Gesture Handler (Pull to Refresh) ---
  //
  // The gesture is enabled ONLY when the WebView is at the very top (scrollY === 0).
  // When disabled, all touches pass through to the WebView so normal scrolling works.
  //
  // When enabled (at top):
  //   - activeOffsetY(15) – only activate after pulling DOWN at least 15px
  //   - failOffsetY(-5)   – fail immediately if the finger moves UP (normal scroll-down)
  const panGesture = useMemo(() => {
    if (!isAtTop) {
      return Gesture.Pan().enabled(false);
    }

    return Gesture.Pan()
      .enabled(true)
      .activeOffsetY(15)
      .failOffsetY(-5)
      .onStart(() => {
        if (isRefreshing.value) {
          translateY.value = 0;
          rotation.value = 0;
        }
      })
      .onUpdate((event) => {
        // Only update the indicator when pulling DOWN (translationY > 0)
        if (event.translationY <= 0) {
          translateY.value = 0;
          rotation.value = 0;
          return;
        }

        // Cap the pull distance and map it to rotation (0 to 360)
        const pullAmount = Math.min(event.translationY, MAX_PULL);
        translateY.value = pullAmount;
        rotation.value = (pullAmount / MAX_PULL) * 360;
      })
      .onEnd(() => {
        // If we pulled far enough (rotation >= 360), trigger a refresh
        if (translateY.value >= MAX_PULL && !isRefreshing.value) {
          isRefreshing.value = true;
          runOnJS(reload)();
        }

        // Spring back to the hidden position (top: -60)
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
      });
  }, [isAtTop, isRefreshing, reload, rotation, translateY]);

  // --- Animated styles ---
  // Moves the indicator down from its hidden position (top: -60)
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value - 60 }],
  }));

  // Rotates the refresh icon
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      {/* Gesture Detector wraps the WebView */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={styles.webViewWrapper}>
          <WebView
            ref={webViewRef}
            source={{ uri: INITIAL_URL }}
            style={styles.webView}
            // --- Crucial: Disable native pull-to-refresh ---
            bounces={false} // iOS
            overScrollMode="never" // Android
            // --- Javascript / DOM / Cookies ---
            javaScriptEnabled
            domStorageEnabled
            thirdPartyCookiesEnabled
            sharedCookiesEnabled
            setSupportMultipleWindows={false}
            javaScriptCanOpenWindowsAutomatically
            allowsBackForwardNavigationGestures
            mediaCapturePermissionGrantType="grant"
            mediaPlaybackRequiresUserAction={false}
            // --- Track scroll position to know if we're at the top ---
            onScroll={(event) => {
              const y = event.nativeEvent.contentOffset.y;
              // Only update state when crossing the top boundary to avoid re-renders
              const atTop = y <= 0;
              if (atTop !== isAtTopRef.current) {
                isAtTopRef.current = atTop;
                setIsAtTop(atTop);
              }
            }}
            // --- Loading state ---
            startInLoadingState
            renderLoading={() => (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.secondary} />
              </View>
            )}
            // --- Error state ---
            renderError={() => (
              <View style={[styles.centered, styles.errorContent]}>
                <Text style={styles.errorTitle}>Unable to load</Text>
                <Text style={styles.errorBody}>
                  Please check your connection and try again.
                </Text>
                <TouchableOpacity
                  onPress={reload}
                  style={styles.retryButton}
                  accessibilityRole="button">
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
            // --- Navigation state tracking ---
            onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
            // --- Reset refreshing when the page finishes loading ---
            onLoadEnd={() => {
              isRefreshing.value = false;
            }}
            onError={() => {
              isRefreshing.value = false;
            }}
            onHttpError={() => {
              isRefreshing.value = false;
            }}
          />

          {/* --- The Custom Pull Indicator (Overlay) --- */}
          <Animated.View
            style={[styles.indicator, indicatorStyle]}
            pointerEvents="none" // Allows touches to pass through to WebView
          >
            <Animated.View style={[styles.indicatorIcon, iconStyle]}>
              <Text style={styles.indicatorGlyph}>⟳</Text>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
}

const colors = {
  primary: '#000000',
  secondary: '#ffffff',
} as const;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  webViewWrapper: { flex: 1, overflow: 'hidden' },
  webView: { flex: 1 },
  centered: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  errorContent: { paddingHorizontal: 32 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: colors.secondary },
  errorBody: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    backgroundColor: colors.secondary,
  },
  retryButtonText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  indicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  indicatorGlyph: { fontSize: 30, color: colors.secondary },
});

export default WebViewScreen;