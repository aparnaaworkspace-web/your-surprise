import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  type SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const SECRET_CODE = 'dna4';
const { width, height } = Dimensions.get('window');
const heartSize = 64;
const unlockDistance = width * 0.58;

const tinyStars = Array.from({ length: 78 }, (_, index) => ({
  id: index,
  left: ((index * 37) % 100),
  top: ((index * 53) % 92) + 2,
  size: 1 + (index % 3) * 0.8,
  delay: (index % 9) * 160,
}));

const chapterStars = [
  { id: 1, left: 16, top: 23 },
  { id: 2, left: 36, top: 15 },
  { id: 3, left: 59, top: 25 },
  { id: 4, left: 77, top: 14 },
  { id: 5, left: 49, top: 39 },
];

const rainDrops = Array.from({ length: 72 }, (_, index) => ({
  id: index,
  left: ((index * 29) % 100),
  delay: (index % 18) * 95,
  duration: 1050 + (index % 8) * 95,
  length: 20 + (index % 4) * 8,
}));

function triggerLightHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

function triggerErrorHaptic() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
}

export default function StoryEntryScreen() {
  const [code, setCode] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isHome, setIsHome] = useState(false);
  const [showScene, setShowScene] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const loginOpacity = useSharedValue(1);
  const homeOpacity = useSharedValue(0);
  const cardEnter = useSharedValue(0);
  const shake = useSharedValue(0);
  const press = useSharedValue(1);
  const quoteOpacity = useSharedValue(0);
  const quoteScale = useSharedValue(0.96);
  const camera = useSharedValue(0);
  const heartX = useSharedValue(0);
  const heartY = useSharedValue(0);
  const delivered = useSharedValue(0);
  const skyReveal = useSharedValue(0);
  const glow = useSharedValue(0);
  const heartPulse = useSharedValue(1);

  useEffect(() => {
    cardEnter.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    heartPulse.value = withRepeat(withTiming(1.08, { duration: 900 }), -1, true);
  }, [cardEnter, heartPulse]);

  useEffect(() => {
    if (!isHome) {
      return;
    }

    homeOpacity.value = withTiming(1, { duration: 620 });
    quoteOpacity.value = withDelay(360, withTiming(1, { duration: 1000 }));
    quoteScale.value = withDelay(360, withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }));
    quoteOpacity.value = withDelay(1850, withTiming(0, { duration: 700 }));
    camera.value = withDelay(2150, withTiming(1, { duration: 4400, easing: Easing.inOut(Easing.cubic) }, () => {
      runOnJS(setShowScene)(true);
    }));
  }, [camera, homeOpacity, isHome, quoteOpacity, quoteScale]);

  const codeDots = useMemo(() => Array.from({ length: 4 }, (_, index) => index), []);

  const submitCode = () => {
    Keyboard.dismiss();
    if (code.trim().toLowerCase() !== SECRET_CODE) {
      setHasError(true);
      triggerErrorHaptic();
      shake.value = withSequence(
        withTiming(-10, { duration: 55 }),
        withTiming(10, { duration: 55 }),
        withTiming(-8, { duration: 55 }),
        withTiming(8, { duration: 55 }),
        withTiming(0, { duration: 70 }),
      );
      return;
    }

    setHasError(false);
    triggerLightHaptic();
    loginOpacity.value = withTiming(0, { duration: 620, easing: Easing.inOut(Easing.cubic) }, () => {
      runOnJS(setIsHome)(true);
    });
  };

  const completeHeartJourney = () => {
    setIsUnlocked(true);
    triggerLightHaptic();
    delivered.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    glow.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }), -1, true);
    skyReveal.value = withDelay(950, withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.cubic) }));
  };

  const panGesture = Gesture.Pan()
    .enabled(showScene && !isUnlocked)
    .onBegin(() => {
      runOnJS(triggerLightHaptic)();
    })
    .onUpdate((event) => {
      heartX.value = Math.max(-width * 0.22, Math.min(unlockDistance, event.translationX));
      heartY.value = Math.max(-80, Math.min(80, event.translationY));
    })
    .onEnd(() => {
      if (heartX.value > unlockDistance * 0.78) {
        heartX.value = withSpring(unlockDistance * 0.82, { damping: 16, stiffness: 120 });
        heartY.value = withSpring(-8, { damping: 16, stiffness: 120 });
        runOnJS(completeHeartJourney)();
      } else {
        heartX.value = withSpring(0, { damping: 15, stiffness: 130 });
        heartY.value = withSpring(0, { damping: 15, stiffness: 130 });
      }
    });

  const loginStyle = useAnimatedStyle(() => ({
    opacity: loginOpacity.value,
    transform: [{ translateX: shake.value }],
  }));

  const homeStyle = useAnimatedStyle(() => ({
    opacity: homeOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardEnter.value,
    transform: [
      { translateY: interpolate(cardEnter.value, [0, 1], [32, 0]) },
      { scale: interpolate(cardEnter.value, [0, 1], [0.96, 1]) },
    ],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));

  const quoteStyle = useAnimatedStyle(() => ({
    opacity: quoteOpacity.value,
    transform: [{ scale: quoteScale.value }],
  }));

  const journeyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(camera.value, [0.02, 0.16, 0.92, 1], [0, 1, 1, 0]),
    transform: [{ scale: interpolate(camera.value, [0, 1], [1, 22]) }],
  }));

  const sceneStyle = useAnimatedStyle(() => ({
    opacity: interpolate(camera.value, [0.86, 1], [0, 1]),
    transform: [
      { scale: interpolate(delivered.value, [0, 1], [1, 1.12]) },
      { translateY: interpolate(skyReveal.value, [0, 1], [0, height * 0.34]) },
    ],
  }));

  const skyStyle = useAnimatedStyle(() => ({
    opacity: skyReveal.value,
    transform: [{ scale: interpolate(skyReveal.value, [0, 1], [1.12, 1]) }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    opacity: interpolate(skyReveal.value, [0, 0.45], [1, 0]),
    transform: [
      { translateX: heartX.value },
      { translateY: heartY.value },
      { scale: heartPulse.value },
    ],
  }));

  const houseGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(delivered.value, [0, 1], [0.16, 0.82]) + glow.value * 0.08,
  }));

  return (
    <View style={styles.screen}>
      {!isHome && (
        <Animated.View style={[styles.absolute, loginStyle]}>
          <LoginScreen
            code={code}
            codeDots={codeDots}
            hasError={hasError}
            onChangeCode={(value) => {
              setCode(value);
              if (hasError) {
                setHasError(false);
              }
            }}
            onPressIn={() => {
              press.value = withTiming(0.97, { duration: 90 });
            }}
            onPressOut={() => {
              press.value = withSpring(1, { damping: 12, stiffness: 180 });
            }}
            onSubmit={submitCode}
            buttonStyle={buttonStyle}
            cardStyle={cardStyle}
          />
        </Animated.View>
      )}

      {isHome && (
        <Animated.View style={[styles.absolute, styles.homeBase, homeStyle]}>
          <Animated.View style={[styles.quoteWrap, quoteStyle]}>
            <Text style={styles.homeQuote}>
              &quot;The world stopped during COVID... My heart{'\n'}didn&apos;t.&quot;
            </Text>
          </Animated.View>

          <Animated.View style={[styles.cosmicJourney, journeyStyle]}>
            <Text style={[styles.cosmicText, styles.earth]}>Earth</Text>
            <Text style={[styles.cosmicText, styles.india]}>India</Text>
            <Text style={[styles.cosmicText, styles.tamilNadu]}>Tamil Nadu</Text>
            <Text style={[styles.cosmicText, styles.streetLabel]}>a quiet street</Text>
          </Animated.View>

          <Animated.View style={[styles.absolute, sceneStyle]}>
            <StreetScene
              houseGlowStyle={houseGlowStyle}
              heartStyle={heartStyle}
              panGesture={panGesture}
              delivered={delivered}
              skyReveal={skyReveal}
            />
          </Animated.View>

          <Animated.View pointerEvents={isUnlocked ? 'auto' : 'none'} style={[styles.absolute, skyStyle]}>
            <ChapterSky />
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

function LoginScreen({
  code,
  codeDots,
  hasError,
  onChangeCode,
  onPressIn,
  onPressOut,
  onSubmit,
  buttonStyle,
  cardStyle,
}: {
  code: string;
  codeDots: number[];
  hasError: boolean;
  onChangeCode: (value: string) => void;
  onPressIn: () => void;
  onPressOut: () => void;
  onSubmit: () => void;
  buttonStyle: object;
  cardStyle: object;
}) {
  return (
    <SafeAreaView style={styles.login}>
      <FloatingStars />
      <View style={styles.brandRow}>
        <Text style={styles.brandSparkle}>✦</Text>
        <Text style={styles.brandText}>Our Story</Text>
      </View>

      <Text style={styles.heroCopy}>
        Some stories are{'\n'}meant for <Text style={styles.goldItalic}>only</Text>{'\n'}
        <Text style={styles.goldItalic}>one heart.</Text>
      </Text>

      <Animated.View style={[styles.loginCard, cardStyle]}>
        <Text style={styles.secretLine}>&quot;If this secret makes you smile...&quot;</Text>
        <Text style={styles.rightPerson}>YOU&apos;RE PROBABLY THE RIGHT{'\n'}PERSON</Text>

        <View style={styles.dotRow}>
          {codeDots.map((dot) => (
            <View key={dot} style={[styles.codeDot, code.length > dot && styles.codeDotFilled]} />
          ))}
        </View>

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardAppearance="dark"
          maxLength={4}
          onChangeText={onChangeCode}
          onSubmitEditing={onSubmit}
          placeholder="Enter our Secret Code"
          placeholderTextColor="#69a8c7"
          returnKeyType="done"
          style={[styles.secretInput, hasError && styles.secretInputError]}
          value={code}
        />
        {hasError && <Text style={styles.errorText}>That is not our secret. Try the date in your heart.</Text>}

        <Pressable onPress={onSubmit} onPressIn={onPressIn} onPressOut={onPressOut}>
          <Animated.View style={[styles.unlockButton, buttonStyle]}>
            <Text style={styles.unlockIcon}>♥</Text>
            <Text style={styles.unlockText}>Unlock Our Story ❤️</Text>
          </Animated.View>
        </Pressable>

        <Text style={styles.forgot}>Forgot the date?</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

function FloatingStars() {
  return (
    <View pointerEvents="none" style={styles.absolute}>
      {tinyStars.slice(0, 22).map((star) => (
        <Twinkle key={star.id} {...star} color={star.id % 4 === 0 ? '#ffd64d' : '#6aa2bd'} />
      ))}
    </View>
  );
}

function Twinkle({ left, top, size, delay, color }: { left: number; top: number; size: number; delay: number; color: string }) {
  const opacity = useSharedValue(0.25);

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1200 }), -1, true));
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.twinkle, { left: `${left}%`, top: `${top}%`, width: size, height: size, backgroundColor: color }, style]} />;
}

function StreetScene({
  houseGlowStyle,
  heartStyle,
  panGesture,
  delivered,
  skyReveal,
}: {
  houseGlowStyle: object;
  heartStyle: object;
  panGesture: ReturnType<typeof Gesture.Pan>;
  delivered: SharedValue<number>;
  skyReveal: SharedValue<number>;
}) {
  const instructionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(delivered.value, [0, 0.2], [1, 0]),
  }));

  return (
    <View style={styles.streetScene}>
      <View style={styles.skyBlue} />
      <Rain delivered={delivered} skyReveal={skyReveal} />
      <View style={styles.vanishingGlow} />
      <View style={styles.road} />
      <View style={[styles.roadLine, styles.roadLineLeft]} />
      <View style={[styles.roadLine, styles.roadLineRight]} />
      <StreetLamp side="left" />
      <StreetLamp side="right" />
      <House side="left" houseGlowStyle={houseGlowStyle} />
      <House side="right" houseGlowStyle={houseGlowStyle} />
      <View style={styles.reflectionPool} />

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.heartWrap, heartStyle]}>
          <View style={styles.heartAura} />
          <Text style={styles.heart}>❤️</Text>
          <View style={styles.heartSpark} />
          <View style={[styles.heartSpark, styles.heartSparkTwo]} />
        </Animated.View>
      </GestureDetector>

      <Animated.Text style={[styles.dragText, instructionStyle]}>DRAG THE HEART TO BEGIN.</Animated.Text>
    </View>
  );
}

function House({ side, houseGlowStyle }: { side: 'left' | 'right'; houseGlowStyle: object }) {
  return (
    <View style={[styles.house, side === 'left' ? styles.leftHouse : styles.rightHouse]}>
      <Animated.View style={[styles.houseAura, houseGlowStyle]} />
      <View style={styles.roof} />
      <View style={styles.houseBody}>
        <View style={styles.windowWide} />
        <View style={styles.windowSmall} />
        <View style={styles.door} />
      </View>
      <View style={styles.steps} />
    </View>
  );
}

function StreetLamp({ side }: { side: 'left' | 'right' }) {
  return (
    <View style={[styles.lamp, side === 'left' ? styles.leftLamp : styles.rightLamp]}>
      <View style={styles.lampGlow} />
      <View style={styles.lampBulb} />
      <View style={styles.lampPole} />
    </View>
  );
}

function Rain({
  delivered,
  skyReveal,
}: {
  delivered: SharedValue<number>;
  skyReveal: SharedValue<number>;
}) {
  return (
    <View pointerEvents="none" style={styles.absolute}>
      {rainDrops.map((drop) => (
        <RainDrop key={drop.id} {...drop} delivered={delivered} skyReveal={skyReveal} />
      ))}
    </View>
  );
}

function RainDrop({
  left,
  delay,
  duration,
  length,
  delivered,
  skyReveal,
}: {
  left: number;
  delay: number;
  duration: number;
  length: number;
  delivered: SharedValue<number>;
  skyReveal: SharedValue<number>;
}) {
  const fall = useSharedValue(0);

  useEffect(() => {
    fall.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false));
  }, [delay, duration, fall]);

  const sparkle = useDerivedValue(() => delivered.value * (1 - skyReveal.value));
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(sparkle.value, [0, 1], [0.25, 0.9]),
    transform: [{ translateY: interpolate(fall.value, [0, 1], [-60, height + 80]) }],
    backgroundColor: sparkle.value > 0.5 ? '#ffe58a' : '#77a9c7',
  }));

  return <Animated.View style={[styles.rainDrop, { left: `${left}%`, height: length }, style]} />;
}

function ChapterSky() {
  return (
    <View style={styles.chapterSky}>
      {tinyStars.map((star) => (
        <Twinkle key={star.id} {...star} color="#d9e9ff" />
      ))}
      {chapterStars.map((star) => (
        <Pressable
          key={star.id}
          onPress={() => {
            triggerLightHaptic();
            router.push(`/chapter/${star.id}` as never);
          }}
          style={[styles.chapterStarButton, { left: `${star.left}%`, top: `${star.top}%` }]}
        >
          <Text style={styles.chapterStar}>✦</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#02070d',
  },
  absolute: {
    ...StyleSheet.absoluteFillObject,
  },
  login: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#00182b',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 28,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 90,
  },
  brandSparkle: {
    color: '#ffd44f',
    fontSize: 34,
    textShadowColor: '#ffd44f',
    textShadowRadius: 16,
  },
  brandText: {
    color: '#f5c84b',
    fontFamily: 'Georgia',
    fontSize: 17,
    fontWeight: '600',
  },
  heroCopy: {
    color: '#fff8ef',
    fontFamily: 'Georgia',
    fontSize: 44,
    fontStyle: 'italic',
    lineHeight: 64,
    marginBottom: 38,
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.25)',
    textShadowRadius: 10,
  },
  goldItalic: {
    color: '#ffd447',
  },
  loginCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(25, 54, 85, 0.82)',
    borderColor: 'rgba(153, 190, 224, 0.28)',
    borderRadius: 34,
    borderWidth: 1,
    maxWidth: 410,
    minHeight: 340,
    paddingHorizontal: 28,
    paddingVertical: 32,
    shadowColor: '#6bbdff',
    shadowOpacity: 0.32,
    shadowRadius: 28,
    width: '100%',
  },
  secretLine: {
    color: '#7fc8e6',
    fontSize: 17,
    fontStyle: 'italic',
    fontWeight: '700',
    marginBottom: 12,
  },
  rightPerson: {
    color: '#bec6d4',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2,
    lineHeight: 24,
    textAlign: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 34,
  },
  codeDot: {
    backgroundColor: '#738195',
    borderRadius: 9,
    height: 18,
    width: 18,
  },
  codeDotFilled: {
    backgroundColor: '#ffd54f',
    shadowColor: '#ffd54f',
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  secretInput: {
    color: '#d5efff',
    fontSize: 18,
    fontWeight: '700',
    height: 48,
    marginTop: 10,
    textAlign: 'center',
    width: '100%',
  },
  secretInputError: {
    color: '#ffb3bd',
  },
  errorText: {
    color: '#ff8fa3',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: -4,
    textAlign: 'center',
  },
  unlockButton: {
    alignItems: 'center',
    backgroundColor: '#085fbd',
    borderRadius: 31,
    flexDirection: 'row',
    gap: 13,
    height: 64,
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: '#0b7fff',
    shadowOpacity: 0.55,
    shadowRadius: 22,
    width: Math.min(width - 86, 350),
  },
  unlockIcon: {
    color: '#ffffff',
    fontSize: 24,
  },
  unlockText: {
    color: '#ffffff',
    fontFamily: 'Georgia',
    fontSize: 17,
    fontWeight: '700',
  },
  forgot: {
    color: '#86c8e6',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 34,
  },
  twinkle: {
    borderRadius: 4,
    position: 'absolute',
    shadowColor: '#ffd95e',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  homeBase: {
    backgroundColor: '#000000',
  },
  quoteWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    left: 20,
    position: 'absolute',
    right: 20,
    top: height * 0.45,
  },
  homeQuote: {
    color: '#ffffff',
    fontFamily: 'Georgia',
    fontSize: 17,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 25,
    textAlign: 'center',
    textShadowColor: '#ffffff',
    textShadowRadius: 7,
  },
  cosmicJourney: {
    alignItems: 'center',
    backgroundColor: '#01050c',
    height: 170,
    justifyContent: 'center',
    left: width * 0.5 - 85,
    position: 'absolute',
    top: height * 0.48 - 85,
    width: 170,
  },
  cosmicText: {
    color: '#cfe7ff',
    fontFamily: 'Georgia',
    fontWeight: '700',
    position: 'absolute',
    textShadowColor: '#48a9ff',
    textShadowRadius: 14,
  },
  earth: {
    fontSize: 28,
    top: 18,
  },
  india: {
    color: '#ffd461',
    fontSize: 19,
    top: 63,
  },
  tamilNadu: {
    fontSize: 13,
    top: 99,
  },
  streetLabel: {
    color: '#ffffff',
    fontSize: 9,
    top: 124,
  },
  streetScene: {
    flex: 1,
    backgroundColor: '#04101b',
    overflow: 'hidden',
  },
  skyBlue: {
    backgroundColor: '#073b70',
    height: '58%',
    opacity: 0.95,
  },
  vanishingGlow: {
    backgroundColor: '#f7c66a',
    borderRadius: 150,
    height: 120,
    left: width * 0.5 - 60,
    opacity: 0.42,
    position: 'absolute',
    top: height * 0.43,
    width: 120,
  },
  road: {
    backgroundColor: '#111a22',
    borderLeftColor: 'transparent',
    borderLeftWidth: width * 0.28,
    borderRightColor: 'transparent',
    borderRightWidth: width * 0.28,
    borderTopColor: '#1d2730',
    borderTopWidth: height * 0.58,
    bottom: 0,
    left: -width * 0.15,
    position: 'absolute',
    width: width * 1.3,
  },
  roadLine: {
    backgroundColor: 'rgba(255,255,255,0.32)',
    height: height * 0.44,
    position: 'absolute',
    top: height * 0.47,
    width: 2,
  },
  roadLineLeft: {
    left: width * 0.26,
    transform: [{ rotate: '12deg' }],
  },
  roadLineRight: {
    right: width * 0.26,
    transform: [{ rotate: '-12deg' }],
  },
  house: {
    position: 'absolute',
    top: height * 0.23,
    width: width * 0.39,
  },
  leftHouse: {
    left: -10,
    transform: [{ perspective: 700 }, { rotateY: '18deg' }],
  },
  rightHouse: {
    right: -10,
    transform: [{ perspective: 700 }, { rotateY: '-18deg' }],
  },
  houseAura: {
    backgroundColor: '#ffd36b',
    borderRadius: 80,
    height: 170,
    left: 10,
    position: 'absolute',
    top: 30,
    width: 150,
  },
  roof: {
    backgroundColor: '#3a2118',
    borderRadius: 6,
    height: 42,
    transform: [{ skewX: '-17deg' }],
    width: '100%',
  },
  houseBody: {
    backgroundColor: '#8a654c',
    borderColor: 'rgba(255,221,157,0.18)',
    borderWidth: 1,
    height: 210,
    marginTop: -4,
    padding: 18,
  },
  windowWide: {
    backgroundColor: '#ffd66e',
    height: 55,
    marginBottom: 20,
    shadowColor: '#ffd66e',
    shadowOpacity: 0.9,
    shadowRadius: 18,
    width: '58%',
  },
  windowSmall: {
    alignSelf: 'flex-end',
    backgroundColor: '#f7c861',
    height: 46,
    shadowColor: '#ffd66e',
    shadowOpacity: 0.7,
    shadowRadius: 16,
    width: '35%',
  },
  door: {
    backgroundColor: '#2e201b',
    bottom: 0,
    height: 70,
    left: 22,
    position: 'absolute',
    width: 34,
  },
  steps: {
    backgroundColor: '#b0a596',
    height: 12,
    marginLeft: 10,
    width: '72%',
  },
  lamp: {
    alignItems: 'center',
    position: 'absolute',
    top: height * 0.42,
  },
  leftLamp: {
    left: width * 0.35,
  },
  rightLamp: {
    right: width * 0.36,
  },
  lampGlow: {
    backgroundColor: '#ffd878',
    borderRadius: 45,
    height: 90,
    opacity: 0.38,
    position: 'absolute',
    top: -34,
    width: 90,
  },
  lampBulb: {
    backgroundColor: '#ffe09b',
    borderRadius: 8,
    height: 14,
    shadowColor: '#ffe09b',
    shadowOpacity: 1,
    shadowRadius: 20,
    width: 14,
  },
  lampPole: {
    backgroundColor: '#494d55',
    height: 130,
    width: 3,
  },
  reflectionPool: {
    alignSelf: 'center',
    backgroundColor: '#315f7f',
    borderRadius: width * 0.32,
    bottom: height * 0.2,
    height: height * 0.16,
    opacity: 0.26,
    position: 'absolute',
    width: width * 0.64,
  },
  heartWrap: {
    alignItems: 'center',
    bottom: height * 0.28,
    height: heartSize,
    justifyContent: 'center',
    left: width * 0.18,
    position: 'absolute',
    width: heartSize,
  },
  heartAura: {
    backgroundColor: '#ff9db1',
    borderRadius: 50,
    height: 78,
    opacity: 0.42,
    position: 'absolute',
    shadowColor: '#ffb4c4',
    shadowOpacity: 0.9,
    shadowRadius: 25,
    width: 78,
  },
  heart: {
    fontSize: 48,
    textShadowColor: '#ffb4c4',
    textShadowRadius: 18,
  },
  heartSpark: {
    backgroundColor: '#f8d65d',
    borderRadius: 3,
    bottom: 7,
    height: 6,
    position: 'absolute',
    right: 5,
    width: 6,
  },
  heartSparkTwo: {
    bottom: 16,
    left: 3,
    right: undefined,
  },
  dragText: {
    bottom: 78,
    color: '#d7d9e2',
    fontSize: 15,
    fontWeight: '800',
    left: 0,
    letterSpacing: 2.6,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
  },
  rainDrop: {
    borderRadius: 3,
    opacity: 0.26,
    position: 'absolute',
    top: 0,
    transform: [{ rotate: '8deg' }],
    width: 1.2,
  },
  chapterSky: {
    flex: 1,
    backgroundColor: '#000000',
  },
  chapterStarButton: {
    alignItems: 'center',
    height: 58,
    justifyContent: 'center',
    position: 'absolute',
    width: 58,
  },
  chapterStar: {
    color: '#ffd85d',
    fontSize: 36,
    textShadowColor: '#ffd85d',
    textShadowRadius: 18,
  },
});
