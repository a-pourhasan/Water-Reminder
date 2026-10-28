import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const BEAKER_HEIGHT = 240;
const EXTRA_BOTTOM = 60;

interface BeakerProps {
  currentMl: number;
  goalMl: number;
  tiltX: number;
  addedAmount?: number;
}

export const WaterGallon: React.FC<BeakerProps> = ({
  currentMl,
  goalMl,
  tiltX,
  addedAmount = 0,
}) => {
  const rawRatio = goalMl > 0 ? currentMl / goalMl : 0;
  const isOverflow = currentMl > goalMl;
  const displayPercentage = Math.round(rawRatio * 100);

  const clampedRatio = Math.min(Math.max(rawRatio, 0), 1);
  const targetHeightPx =
    currentMl === 0 ? 0 : clampedRatio * BEAKER_HEIGHT + EXTRA_BOTTOM;

  const animatedHeight = useSharedValue(0);
  const animatedRotation = useSharedValue(0);

  // انیمیشن قطرات سرریز
  const dropLeftY = useSharedValue(0);
  const dropLeftOpacity = useSharedValue(0);
  const dropRightY = useSharedValue(0);
  const dropRightOpacity = useSharedValue(0);

  // انیمیشن جمع شدن آب کف زمین (Puddle)
  const puddleScale = useSharedValue(0);
  const puddleOpacity = useSharedValue(0);

  // بالا آمدن سطح مایع داخل ظرف
  useEffect(() => {
    animatedHeight.value = withSpring(targetHeightPx, {
      damping: 18,
      stiffness: 90,
    });
  }, [targetHeightPx]);

  // زاویه تراز مایع بر اساس شتاب‌سنج
  useEffect(() => {
    const deg = -tiltX * 28;
    animatedRotation.value = withTiming(deg, { duration: 60 });
  }, [tiltX]);

  // انیمیشن پدیدار شدن و خشک شدن آب کف زمین
  useEffect(() => {
    if (isOverflow) {
      puddleScale.value = withSpring(1, { damping: 14, stiffness: 70 });
      puddleOpacity.value = withTiming(1, { duration: 400 });
    } else {
      puddleScale.value = withTiming(0, { duration: 350 });
      puddleOpacity.value = withTiming(0, { duration: 350 });
    }
  }, [isOverflow]);

  // فیزیک ریزش محدود قطرات در هنگام سرریز
  useEffect(() => {
    if (!isOverflow || currentMl <= 0 || addedAmount <= 0) {
      dropLeftOpacity.value = 0;
      dropRightOpacity.value = 0;
      dropLeftY.value = 0;
      dropRightY.value = 0;
      return;
    }

    const dripCount = addedAmount >= 500 ? 6 : 3;

    const dropMotion = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(12, { duration: 180, easing: Easing.out(Easing.ease) }),
      withTiming(220, { duration: 480, easing: Easing.in(Easing.quad) }),
      withTiming(0, { duration: 0 }),
    );

    const dropFade = withSequence(
      withTiming(1, { duration: 120 }),
      withTiming(1, { duration: 360 }),
      withTiming(0, { duration: 180 }),
    );

    dropLeftY.value = withRepeat(dropMotion, dripCount, false);
    dropLeftOpacity.value = withRepeat(dropFade, dripCount, false);

    dropRightY.value = withDelay(220, withRepeat(dropMotion, dripCount, false));
    dropRightOpacity.value = withDelay(
      220,
      withRepeat(dropFade, dripCount, false),
    );
  }, [currentMl, isOverflow, addedAmount]);

  const waterAnimatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    transform: [{ rotate: `${animatedRotation.value}deg` }],
  }));

  const dropLeftAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dropLeftOpacity.value * (tiltX > 0.3 ? 0.2 : 1),
    transform: [{ translateY: dropLeftY.value }],
  }));

  const dropRightAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dropRightOpacity.value * (tiltX < -0.3 ? 0.2 : 1),
    transform: [{ translateY: dropRightY.value }],
  }));

  // انیمیشن حوضچه کف زمین سمت چپ متناسب با شیب
  const puddleLeftAnimatedStyle = useAnimatedStyle(() => {
    const tiltMultiplier = Math.max(0.4, 1 - tiltX * 0.6);
    return {
      opacity: puddleOpacity.value,
      transform: [
        { scaleX: puddleScale.value * tiltMultiplier },
        { scaleY: puddleScale.value },
      ],
    };
  });

  // انیمیشن حوضچه کف زمین سمت راست متناسب با شیب
  const puddleRightAnimatedStyle = useAnimatedStyle(() => {
    const tiltMultiplier = Math.max(0.4, 1 + tiltX * 0.6);
    return {
      opacity: puddleOpacity.value * 0.95,
      transform: [
        { scaleX: puddleScale.value * tiltMultiplier },
        { scaleY: puddleScale.value },
      ],
    };
  });

  return (
    <View style={styles.container}>
      {/* قطرات سرریز بیرونی */}
      <View style={styles.outerDropsContainer}>
        <Animated.View
          style={[styles.drop, styles.dropLeft, dropLeftAnimatedStyle]}
        />
        <Animated.View
          style={[styles.drop, styles.dropRight, dropRightAnimatedStyle]}
        />
      </View>

      {/* جمع شدن آب کف زمین در دو طرف پایه بشر */}
      <View style={styles.puddleWrapper}>
        <Animated.View
          style={[styles.puddle, styles.puddleLeft, puddleLeftAnimatedStyle]}
        />
        <Animated.View
          style={[styles.puddle, styles.puddleRight, puddleRightAnimatedStyle]}
        />
      </View>

      {/* لبه بالای دهانه بشر */}
      <View style={styles.beakerRimWrapper}>
        <View style={styles.spoutNose} />
        <View style={styles.topRimBar} />
      </View>

      {/* بدنه شیشه‌ای بشر */}
      <View style={styles.beakerGlass}>
        <View style={styles.scaleContainer}>
          <View style={[styles.scaleMark, styles.scaleMarkLong]} />
          <View style={styles.scaleMark} />
          <View style={[styles.scaleMark, styles.scaleMarkLong]} />
          <View style={styles.scaleMark} />
          <View style={[styles.scaleMark, styles.scaleMarkLong]} />
        </View>

        {/* آب درون بشر */}
        <Animated.View style={[styles.liquidBox, waterAnimatedStyle]} />

        {/* لایه متون و درصد */}
        <View style={styles.infoLayer}>
          <Text style={styles.percentageText}>{displayPercentage}%</Text>
          <Text style={styles.volumeText}>
            {currentMl} / {goalMl} ml
          </Text>
          {isOverflow && (
            <Text style={styles.spillAlert}>💧 Full & Overflowing!</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
    width: 240,
  },
  outerDropsContainer: {
    ...StyleSheet.absoluteFill,
    top: 6,
    left: 14,
    right: 14,
    zIndex: 20,
    pointerEvents: 'none',
  },
  drop: {
    position: 'absolute',
    width: 6,
    height: 12,
    borderRadius: 3,
    backgroundColor: '#0284c7',
  },
  dropLeft: {
    left: 2,
    top: 6,
  },
  dropRight: {
    right: 2,
    top: 6,
  },
  puddleWrapper: {
    position: 'absolute',
    bottom: -3,
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 1,
    pointerEvents: 'none',
  },
  puddle: {
    backgroundColor: '#38bdf8',
    height: 9,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  puddleLeft: {
    width: 52,
    marginLeft: 0,
  },
  puddleRight: {
    width: 44,
    marginRight: 2,
  },
  beakerRimWrapper: {
    width: 200,
    height: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  spoutNose: {
    position: 'absolute',
    left: -6,
    top: -2,
    width: 14,
    height: 8,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#94a3b8',
    transform: [{ rotate: '-35deg' }],
  },
  topRimBar: {
    width: 194,
    height: 6,
    backgroundColor: '#cbd5e1',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#94a3b8',
  },
  beakerGlass: {
    width: 184,
    height: BEAKER_HEIGHT,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 5,
    borderTopWidth: 0,
    borderColor: '#94a3b8',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    zIndex: 5,
  },
  liquidBox: {
    width: 500,
    backgroundColor: '#38bdf8',
    position: 'absolute',
    bottom: -EXTRA_BOTTOM,
    left: -158,
  },
  scaleContainer: {
    position: 'absolute',
    left: 8,
    top: 20,
    bottom: 20,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  scaleMark: {
    width: 10,
    height: 2,
    backgroundColor: 'rgba(100, 116, 139, 0.5)',
  },
  scaleMarkLong: {
    width: 20,
    backgroundColor: '#64748b',
  },
  infoLayer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  percentageText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0369a1',
  },
  volumeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 4,
  },
  spillAlert: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0284c7',
    marginTop: 4,
  },
});
