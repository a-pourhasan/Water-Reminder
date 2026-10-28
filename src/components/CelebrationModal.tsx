import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiPieceProps {
  index: number;
}

const COLORS = [
  '#38bdf8',
  '#0284c7',
  '#34d399',
  '#facc15',
  '#f43f5e',
  '#a855f7',
];

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ index }) => {
  const startX = Math.random() * SCREEN_WIDTH;
  const targetX = startX + (Math.random() * 120 - 60);
  const targetY = SCREEN_HEIGHT * (0.65 + Math.random() * 0.35);

  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const randomColor = COLORS[index % COLORS.length];
  const size = Math.random() * 8 + 8;
  const isCircle = index % 2 === 0;

  useEffect(() => {
    const delay = Math.random() * 400;

    translateY.value = withDelay(
      delay,
      withTiming(targetY, {
        duration: 2200 + Math.random() * 800,
        easing: Easing.out(Easing.quad),
      }),
    );

    translateX.value = withDelay(
      delay,
      withTiming(targetX, { duration: 2400 }),
    );

    rotate.value = withDelay(
      delay,
      withTiming(Math.random() * 720 - 360, { duration: 2500 }),
    );

    opacity.value = withDelay(1800 + delay, withTiming(0, { duration: 800 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        animatedStyle,
        {
          width: size,
          height: isCircle ? size : size * 1.5,
          borderRadius: isCircle ? size / 2 : 2,
          backgroundColor: randomColor,
        },
      ]}
    />
  );
};

interface CelebrationModalProps {
  visible: boolean;
  dailyGoalMl: number;
  onClose: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  dailyGoalMl,
  onClose,
}) => {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // شلیک ویبره الگوی موفقیت‌آمیز گوشی
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );

      scale.value = withSpring(1, { damping: 12, stiffness: 140 });
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      scale.value = 0.7;
      opacity.value = 0;
    }
  }, [visible]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* تولید ۳۵ تکه کاغذ رنگی معلق */}
      {Array.from({ length: 35 }).map((_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}

      <View style={styles.centerContainer}>
        <Animated.View style={[styles.dialogCard, cardStyle]}>
          <Text style={styles.trophy}>🏆</Text>
          <Text style={styles.congratsTitle}>Goal Accomplished!</Text>
          <Text style={styles.congratsBody}>
            You’ve successfully reached your daily target of{' '}
            <Text style={styles.highlightText}>{dailyGoalMl} ml</Text>.
            Excellent hydration today!
          </Text>

          <Pressable style={styles.continueBtn} onPress={onClose}>
            <Text style={styles.continueBtnText}>Awesome!</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  dialogCard: {
    width: '84%',
    maxWidth: 320,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  trophy: {
    fontSize: 54,
    marginBottom: 8,
  },
  congratsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  congratsBody: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  highlightText: {
    color: '#0284c7',
    fontWeight: 'bold',
  },
  continueBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginTop: 20,
  },
  continueBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
