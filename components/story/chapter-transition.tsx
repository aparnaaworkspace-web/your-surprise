import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { STORY_FONT_FAMILY } from '@/constants/typography';

const { width, height } = Dimensions.get('window');
const starButtonSize = 58;

export function ChapterTransition({
  quote,
  originLeftPercent,
  originTopPercent,
  onComplete,
}: {
  quote: string;
  originLeftPercent: number;
  originTopPercent: number;
  onComplete: () => void;
}) {
  const progress = useSharedValue(0);
  const quoteOpacity = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 1180,
      easing: Easing.bezier(0.2, 0.9, 0.24, 1),
    });
    quoteOpacity.value = withDelay(
      980,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) })
    );

    const timer = setTimeout(() => {
      onComplete();
    }, 2600);

    return () => clearTimeout(timer);
  }, [onComplete, progress, quoteOpacity]);

  const startX = (width * originLeftPercent) / 100 - starButtonSize / 2;
  const startY = (height * originTopPercent) / 100 - starButtonSize / 2;
  const targetX = width / 2 - starButtonSize / 2;
  const targetY = height * 0.27;

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.55, 1], [0, 0.72, 1]),
  }));

  const starStyle = useAnimatedStyle(() => ({
    left: interpolate(progress.value, [0, 1], [startX, targetX]),
    top: interpolate(progress.value, [0, 1], [startY, targetY]),
    transform: [
      { scale: interpolate(progress.value, [0, 0.45, 1], [1, 1.3, 1.6]) },
    ],
  }));

  const quoteStyle = useAnimatedStyle(() => ({
    opacity: quoteOpacity.value,
    transform: [{ translateY: interpolate(quoteOpacity.value, [0, 1], [18, 0]) }],
  }));

  return (
    <View pointerEvents="none" style={styles.container}>
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      <Animated.Text style={[styles.star, starStyle]}>{'\u2726'}</Animated.Text>
      <Animated.View style={[styles.copyWrap, quoteStyle]}>
        <Text style={styles.quote}>{quote}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  star: {
    color: '#ffd85d',
    fontSize: 44,
    position: 'absolute',
    textAlign: 'center',
    textShadowColor: '#ffd85d',
    textShadowRadius: 22,
    width: starButtonSize,
  },
  copyWrap: {
    left: 28,
    position: 'absolute',
    right: 28,
    top: height * 0.42,
  },
  title: {
    color: '#f8fbff',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 25,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  quote: {
    color: '#f8fbff',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 28,
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.35)',
    textShadowRadius: 10,
  },
});
