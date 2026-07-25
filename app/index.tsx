import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BackHandler,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ImageBackground,
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

import { getChapter } from '@/components/story/chapter-data';
import { ChapterTransition } from '@/components/story/chapter-transition';
import { STORY_FONT_FAMILY } from '@/constants/typography';

const SECRET_CODE = 'dna4';
const { width, height } = Dimensions.get('window');
const heartSize = 64;
const unlockDistance = width * 0.58;

const tinyStars = Array.from({ length: 78 }, (_, index) => ({
  id: index,
  left: Math.random() * 100,
  top: Math.random() * 95,
  size: 1 + Math.random() * 2.8,
  delay: Math.random() * 1800,
}));

const chapterStars = [
  { id: 1, left: 9, top: 5 },
  { id: 2, left: 76, top: 32 },
  { id: 3, left: 22, top: 56 },
  { id: 4, left: 72, top: 72 },
  { id: 5, left: 48, top: 88 },
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
  const { scene } = useLocalSearchParams<{ scene?: string }>();
  const [code, setCode] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isHome, setIsHome] = useState(false);
  const [showScene, setShowScene] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [homeStep, setHomeStep] = useState<'quote' | 'scene' | 'sky'>('quote');
  const [transitioningChapterId, setTransitioningChapterId] = useState<number | null>(null);

  const loginOpacity = useSharedValue(1);
  const homeOpacity = useSharedValue(1);
  const cardEnter = useSharedValue(1);
  const shake = useSharedValue(0);
  const press = useSharedValue(1);
  const quoteOpacity = useSharedValue(1);
  const quoteScale = useSharedValue(0.96);
  const camera = useSharedValue(0);
  const heartX = useSharedValue(0);
  const heartY = useSharedValue(0);
  const delivered = useSharedValue(0);
  const skyReveal = useSharedValue(0);
  const glow = useSharedValue(0);
  const heartPulse = useSharedValue(1);

  useEffect(() => {
    heartPulse.value = withRepeat(withTiming(1.08, { duration: 900 }), -1, true);
  }, [heartPulse]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isHome) {
        return false;
      }

      if (transitioningChapterId !== null) {
        setTransitioningChapterId(null);
        return true;
      }

      if (homeStep === 'sky') {
        setHomeStep('scene');
        setIsUnlocked(false);
        delivered.value = 0;
        skyReveal.value = withTiming(0, { duration: 360, easing: Easing.out(Easing.cubic) });
        heartX.value = withSpring(0, { damping: 15, stiffness: 130 });
        heartY.value = withSpring(0, { damping: 15, stiffness: 130 });
      } else if (homeStep === 'scene') {
        setHomeStep('quote');
        setShowScene(false);
        camera.value = 0;
        quoteOpacity.value = 1;
        quoteScale.value = 1;
      } else {
        setIsHome(false);
        setShowScene(false);
        setIsUnlocked(false);
        loginOpacity.value = 1;
        homeOpacity.value = 1;
        quoteOpacity.value = 1;
        quoteScale.value = 0.96;
        camera.value = 0;
        heartX.value = 0;
        heartY.value = 0;
        delivered.value = 0;
        skyReveal.value = 0;
        glow.value = 0;
      }
      return true;
    });

    return () => subscription.remove();
  }, [
    camera,
    delivered,
    glow,
    heartX,
    heartY,
    homeOpacity,
    homeStep,
    isHome,
    loginOpacity,
    quoteOpacity,
    quoteScale,
    skyReveal,
    transitioningChapterId,
  ]);

  useEffect(() => {
    if (!isHome) {
      return;
    }

    if (scene === 'houses') {
      homeOpacity.value = 1;
      loginOpacity.value = 0;
      quoteOpacity.value = 0;
      quoteScale.value = 1;
      camera.value = 1;
      skyReveal.value = 0;
      delivered.value = 0;
      heartX.value = 0;
      heartY.value = 0;
      setHomeStep('scene');
      setShowScene(true);
      setIsUnlocked(false);
      return;
    }

    homeOpacity.value = 1;
    setHomeStep('quote');
    setShowScene(true);
    camera.value = 0;
    skyReveal.value = 0;
    delivered.value = 0;
    quoteOpacity.value = 1;
    quoteScale.value = 1;

    quoteOpacity.value = withDelay(
      900,
      withTiming(0, {
        duration: 500,
        easing: Easing.inOut(Easing.cubic),
      })
    );

    camera.value = withDelay(
      900,
      withTiming(1, {
        duration: 600,
        easing: Easing.inOut(Easing.cubic),
      }, () => {
        runOnJS(setHomeStep)('scene');
      })
    );
  }, [camera, delivered, heartX, heartY, homeOpacity, isHome, loginOpacity, quoteOpacity, quoteScale, scene, skyReveal]);

  useEffect(() => {
    if (scene !== 'houses') {
      return;
    }

    setIsHome(true);
  }, [scene]);

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
    runOnJS(setIsHome)(true);

    loginOpacity.value = withTiming(0, {
      duration: 620,
      easing: Easing.inOut(Easing.cubic),
    });
  };

  const completeHeartJourney = () => {
    setIsUnlocked(true);
    triggerLightHaptic();
    delivered.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    glow.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }), -1, true);
    skyReveal.value = withDelay(420, withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.cubic) }, () => {
      runOnJS(setHomeStep)('sky');
    }));
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
    opacity: 0,
  }));

  const sceneStyle = useAnimatedStyle(() => ({
    opacity: interpolate(camera.value, [0, 1], [0, 1]),
    transform: [
      { translateY: interpolate(skyReveal.value, [0, 1], [0, height * 0.24]) },
      { scale: interpolate(skyReveal.value, [0, 1], [1, 2.25]) },
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

  const startChapterTransition = (chapterId: number) => {
    triggerLightHaptic();
    setTransitioningChapterId(chapterId);
  };

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
              &quot;The world stopped during COVID,{'\n'}my heart didn&apos;t...&quot;
            </Text>
          </Animated.View>

          <Animated.View pointerEvents="none" style={[styles.cosmicJourney, journeyStyle]} />

          <Animated.View style={[styles.absolute, sceneStyle]}>
            <StreetScene
              heartStyle={heartStyle}
              panGesture={panGesture}
              delivered={delivered}
              skyReveal={skyReveal}
            />
          </Animated.View>

          <Animated.View pointerEvents={isUnlocked ? 'auto' : 'none'} style={[styles.absolute, skyStyle]}>
            <ChapterSky
              activeChapterId={transitioningChapterId}
              onSelectChapter={startChapterTransition}
            />
          </Animated.View>

          {transitioningChapterId !== null && getChapter(transitioningChapterId) && (
            <ChapterTransition
              onComplete={() => {
                const chapterId = transitioningChapterId;
                setTransitioningChapterId(null);
                router.push(`/chapter/${chapterId}` as never);
              }}
              originLeftPercent={chapterStars.find((star) => star.id === transitioningChapterId)?.left ?? 50}
              originTopPercent={chapterStars.find((star) => star.id === transitioningChapterId)?.top ?? 50}
              quote={getChapter(transitioningChapterId)?.quote ?? ''}
            />
          )}
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
  const inputRef = useRef<TextInput>(null);
  const keyboardProgress = useSharedValue(0);
  const focusSecretInput = () => inputRef.current?.focus();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, () => {
      keyboardProgress.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      keyboardProgress.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [keyboardProgress]);

  const keyboardContentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(keyboardProgress.value, [0, 1], [0, -18]) },
      { scale: interpolate(keyboardProgress.value, [0, 1], [1, 0.9]) },
    ],
  }));

  return (
    <SafeAreaView style={styles.login}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.keyboardFrame}
      >
        <Animated.View style={[styles.loginContent, keyboardContentStyle]}>
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
        <View style={styles.cardContent}>
        <Text style={styles.secretLine}>&quot;If this secret makes you smile...&quot;</Text>
        <Text style={styles.rightPerson}>YOU&apos;RE PROBABLY THE RIGHT PERSON</Text>
        

      <Pressable
        style={styles.passcodeContainer}
        onPress={focusSecretInput}
      >
        {[0, 1, 2, 3].map((index) => (
          <View key={index} style={styles.passcodeCircle}>
            <Text style={styles.passcodeText}>
              {showPassword ? code[index] ?? '' : code[index] ? '•' : ''}
            </Text>
          </View>
        ))}

        <Pressable
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color="#A7D6FF"
          />
        </Pressable>
      </Pressable>

      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={onChangeCode}
        maxLength={4}
        style={styles.secretInput}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={false}
      />
        {hasError && <Text style={styles.errorText}>That is not our secret. Try the code in your heart.</Text>}
        </View>
        

        <Pressable onPress={onSubmit} onPressIn={onPressIn} onPressOut={onPressOut}>
          <Animated.View style={[styles.unlockButton, buttonStyle]}>
            <Text style={styles.unlockText}>Unlock Our Story ❤️</Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
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
  heartStyle,
  panGesture,
  delivered,
  skyReveal,
}: {
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
      <ImageBackground
        source={require('../assets/images/two-houses.png')}
        resizeMode="cover"
        style={styles.houseBackground}
      >
    <Rain delivered={delivered} skyReveal={skyReveal} />

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.heartWrap, heartStyle]}>
          <View style={styles.heartAura} />
          <Text style={styles.heart}>❤️</Text>
          <View style={styles.heartSpark} />
          <View style={[styles.heartSpark, styles.heartSparkTwo]} />
        </Animated.View>
      </GestureDetector>

      <Animated.Text style={[styles.dragText, instructionStyle]}>DRAG THE HEART TO BEGIN.</Animated.Text>
      </ImageBackground>
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LegacyChapterSky({
  activeChapterId,
  onSelectChapter,
}: {
  activeChapterId: number | null;
  onSelectChapter: (chapterId: number) => void;
}) {
  return (
      <LinearGradient
        colors={['#071B33', '#163C69', '#0A2342']}
        locations={[0, 0.55, 1]}
        style={styles.chapterSky}
      >
      {tinyStars.map((star) => (
        <Twinkle key={star.id} {...star} color={star.id % 5 === 0 ? '#9fd6ff' : '#d9e9ff'} />
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
    </LinearGradient>
  );
}

function ChapterSky({
  activeChapterId,
  onSelectChapter,
}: {
  activeChapterId: number | null;
  onSelectChapter: (chapterId: number) => void;
}) {
  return (
    <LinearGradient colors={['#071B33', '#163C69', '#0A2342']} locations={[0, 0.55, 1]} style={styles.chapterSky}>
      {tinyStars.map((star) => (
        <Twinkle key={star.id} {...star} color={star.id % 5 === 0 ? '#9fd6ff' : '#d9e9ff'} />
      ))}
      {chapterStars.map((star) => (
        <SkyStar
          activeChapterId={activeChapterId}
          key={star.id}
          onPress={() => onSelectChapter(star.id)}
          star={star}
        />
      ))}
    </LinearGradient>
  );
}

function SkyStar({
  star,
  activeChapterId,
  onPress,
}: {
  star: { id: number; left: number; top: number };
  activeChapterId: number | null;
  onPress: () => void;
}) {
  const fade = useSharedValue(activeChapterId === null ? 1 : 0);

  useEffect(() => {
    const isVisible = activeChapterId === null || activeChapterId === star.id;
    fade.value = withTiming(isVisible ? 1 : 0, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeChapterId, fade, star.id]);

  const starStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ scale: interpolate(fade.value, [0, 1], [0.76, 1]) }],
  }));

  return (
    <Animated.View style={[styles.chapterStarButton, { left: `${star.left}%`, top: `${star.top}%` }, starStyle]}>
      <Pressable onPress={onPress} style={styles.chapterStarTouch}>
        <Text style={styles.chapterStar}>{'\u2726'}</Text>
      </Pressable>
    </Animated.View>
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
    overflow: 'hidden',
  },
  keyboardFrame: {
    flex: 1,
    width: '100%',
  },
  loginContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
    paddingHorizontal: 28,
    paddingTop: 18,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 56,
  },
  brandSparkle: {
    color: '#ffd44f',
    fontSize: 34,
    textShadowColor: '#ffd44f',
    textShadowRadius: 16,
  },
  brandText: {
    color: '#f5c84b',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 17,
    fontWeight: '600',
  },
  heroCopy: {
    color: '#fff8ef',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: Math.min(31, width * 0.078),
    fontStyle: 'italic',
    lineHeight: Math.min(44, width * 0.11),
    marginBottom: 14,
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
    minHeight: 312,
    paddingHorizontal: 28,
    paddingBottom: 31,
    justifyContent: 'space-between',
    paddingTop: 29,
    shadowColor: '#6bbdff',
    shadowOpacity: 0.32,
    shadowRadius: 28,
    width: '100%',
  },
  secretLine: {
    color: '#7fc8e6',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 17,
    fontStyle: 'italic',
    fontWeight: '700',
    marginBottom: 12,
  },
  rightPerson: {
    color: '#bec6d4',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2,
    lineHeight: 24,
    textAlign: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 18,
  },
  codeTouchArea: {
    marginTop: 27,
    paddingHorizontal: 18,
    paddingVertical: 12,
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
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  inputContainer: {
    marginTop: 24,
    width: '82%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secretInputError: {
    color: '#ffb3bd',
  },
  errorText: {
    color: '#ff8fa3',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 2,
    lineHeight: 18,
    textAlign: 'center',
  },
  passcodeContainer: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passcodeCircle: {
    width: 30,
    height: 30,
    marginHorizontal: 7,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passcodeText: {
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 18,
    color: '#EAF7FF',
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false, 
    textAlignVertical: 'center', 
  },
  eyeButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 24,
    width: 32,
  },
  unlockButton: {
    alignItems: 'center',
    backgroundColor: '#085fbd',
    borderRadius: 31,
    flexDirection: 'row',
    gap: 13,
    height: 56,
    justifyContent: 'center',
    marginTop: 25,
    shadowColor: '#0b7fff',
    shadowOpacity: 0.55,
    shadowRadius: 22,
    width: Math.min(width - 104, 316),
  },
  unlockIcon: {
    color: '#ffffff',
    fontSize: 24,
  },
  unlockText: {
    color: '#ffffff',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 15,
    fontWeight: '700',
  },
  cardContent: {
    width: '100%',
    alignItems: 'center',
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
    fontFamily: STORY_FONT_FAMILY,
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
    height: '100%',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  earthZoomStage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  globe: {
    alignItems: 'center',
    backgroundColor: '#0b56a1',
    borderColor: 'rgba(165, 220, 255, 0.42)',
    borderRadius: 118,
    borderWidth: 1,
    height: 236,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: '#4db7ff',
    shadowOpacity: 0.76,
    shadowRadius: 38,
    width: 236,
  },
  globeGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 118,
  },
  landMass: {
    backgroundColor: '#2aa96f',
    position: 'absolute',
  },
  landOne: {
    borderRadius: 34,
    height: 70,
    left: 42,
    top: 42,
    transform: [{ rotate: '-18deg' }],
    width: 92,
  },
  landTwo: {
    borderRadius: 38,
    height: 88,
    right: 32,
    top: 82,
    transform: [{ rotate: '24deg' }],
    width: 76,
  },
  landThree: {
    borderRadius: 28,
    bottom: 38,
    height: 52,
    left: 80,
    transform: [{ rotate: '12deg' }],
    width: 68,
  },
  locationCard: {
    alignItems: 'center',
    position: 'absolute',
  },
  locationTitle: {
    color: '#ffffff',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 32,
    fontWeight: '700',
    textShadowColor: '#59b9ff',
    textShadowRadius: 18,
  },
  locationLine: {
    backgroundColor: '#6bbdff',
    borderRadius: 2,
    height: 3,
    marginTop: 10,
    width: 120,
  },
  locationLineGold: {
    backgroundColor: '#ffd461',
  },
  destinationPreview: {
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
    borderWidth: 1,
    height: height * 0.52,
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: '#6bbdff',
    shadowOpacity: 0.4,
    shadowRadius: 28,
    width: width * 0.78,
  },
  destinationImage: {
    flex: 1,
  },
  destinationVignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 18, 38, 0.22)',
  },
  streetScene: {
    flex: 1,
    backgroundColor: '#04101b',
    overflow: 'hidden',
  },
  houseBackground: {
    flex: 1,
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
    fontFamily: STORY_FONT_FAMILY,
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
    backgroundColor: '#071B33',
    overflow: 'hidden',
  },
  chapterStarButton: {
    alignItems: 'center',
    height: 58,
    justifyContent: 'center',
    position: 'absolute',
    width: 58,
  },
  chapterStarTouch: {
    alignItems: 'center',
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  chapterStar: {
    color: '#ffd85d',
    fontSize: 36,
    textShadowColor: '#ffd85d',
    textShadowRadius: 18,
  },
});
