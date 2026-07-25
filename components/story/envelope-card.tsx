import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { STORY_FONT_FAMILY } from '@/constants/typography';

export function EnvelopeCard({
  title,
  body,
  isOpen,
  onPress,
  driftDelay = 0,
  offsetX = 0,
  tilt = 0,
}: {
  title: string;
  body: string;
  isOpen: boolean;
  onPress: () => void;
  driftDelay?: number;
  offsetX?: number;
  tilt?: number;
}) {
  const open = useSharedValue(isOpen ? 1 : 0);
  const drift = useSharedValue(0);

  useEffect(() => {
    open.value = withTiming(isOpen ? 1 : 0, {
      duration: 560,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
    });
  }, [isOpen, open]);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, {
        duration: 2400 + driftDelay,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, [drift, driftDelay]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX + interpolate(drift.value, [0, 1], [-3, 3]) },
      { translateY: interpolate(drift.value, [0, 1], [0, -7]) },
      { rotateZ: `${tilt + interpolate(drift.value, [0, 1], [-0.7, 0.7])}deg` },
      { scale: interpolate(open.value, [0, 1], [1, 1.01]) },
    ],
  }));

  const flapStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateX: `${interpolate(open.value, [0, 0.38, 1], [0, -172, -172])}deg` },
    ],
  }));

  const paperStyle = useAnimatedStyle(() => ({
    height: interpolate(open.value, [0, 0.42, 0.82, 1], [0, 0, 182, 192]),
    opacity: interpolate(open.value, [0, 0.36, 0.48, 1], [0, 0, 1, 1]),
    transform: [
      { translateY: interpolate(open.value, [0, 0.42, 0.82, 1], [22, 14, -42, -54]) },
      { scaleY: interpolate(open.value, [0, 0.42, 0.7, 1], [0.94, 0.94, 1.04, 1]) },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(open.value, [0.65, 1], [0, 1]),
    transform: [
      { translateY: interpolate(open.value, [0.6, 1], [16, 0]) },
      { scale: interpolate(open.value, [0.6, 0.86, 1], [0.98, 1.02, 1]) },
    ],
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.cardWrap, cardStyle]}>
        <Animated.View style={[styles.paper, paperStyle]}>
          <Animated.Text style={[styles.paperText, textStyle]}>{body}</Animated.Text>
        </Animated.View>

        <View style={styles.envelopeBody}>
          <Animated.View style={[styles.flap, flapStyle]} />
          <View style={styles.innerShadow} />
          <View style={styles.seal} />
          <Text style={styles.title}>{title}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    alignItems: 'center',
    marginBottom: 36,
  },
  paper: {
    backgroundColor: '#fff8ef',
    borderRadius: 18,
    marginBottom: -40,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingTop: 28,
    width: 320,
  },
  paperText: {
    color: '#4d4137',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
  envelopeBody: {
    alignItems: 'center',
    backgroundColor: '#fffaf2',
    borderRadius: 6,
    height: 148,
    overflow: 'hidden',
    width: 320,
  },
  flap: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 160,
    borderRightColor: 'transparent',
    borderRightWidth: 160,
    borderTopColor: '#f3ebd1',
    borderTopWidth: 78,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  innerShadow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 20, 40, 0.02)',
  },
  seal: {
    backgroundColor: '#a20808',
    borderColor: '#bb3c32',
    borderRadius: 26,
    borderWidth: 3,
    height: 52,
    left: '50%',
    marginLeft: -26,
    position: 'absolute',
    top: 53,
    width: 52,
    zIndex: 2,
  },
  title: {
    color: '#6f5746',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 21,
    fontStyle: 'italic',
    marginTop: 100,
  },
});
