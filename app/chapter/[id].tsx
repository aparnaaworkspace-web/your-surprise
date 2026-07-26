import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { getChapter } from '@/components/story/chapter-data';
import { EnvelopeCard } from '@/components/story/envelope-card';
import { MusicCard } from '@/components/story/music-card';
import { STORY_FONT_FAMILY } from '@/constants/typography';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const PHOTO_CARD_WIDTH = 110;
const PHOTO_CARD_HEIGHT = 146;
const PHOTO_CARD_GAP = 18;
const nightSkyDots = Array.from({ length: 58 }, (_, index) => ({
  id: index,
  left: (index * 17) % 100,
  top: (index * 29) % 100,
  size: 1 + (index % 3),
  color: index % 7 === 0 ? '#d9bf66' : '#8fb0ce',
  opacity: index % 5 === 0 ? 0.75 : 0.4,
}));

const chapterOneLetters = [
  {
    title: 'Your Humor',
    body: "I fell in love somewhere between your silly jokes and my endless laughter. You never even tried, yet you became my favorite reason to smile. Your humor will always be my happiest memory of us.",
  },
  {
    title: 'Your Smile',
    body: "Every time you smile, something beautiful blooms inside my heart. For a moment, the whole world feels brighter because of you. If peace had a face, it would be your smile.",
  },
  {
    title: 'The Way You Were',
    body: "You protected me in ways you never even realized-through midnight stories, little victories, and quiet support. You protected my heart long before either of us realized it. Maybe that's when home quietly became you.",
  },
];

const chapterTwoSongs: {
  id: string;
  title: string;
  description: string;
  imageSource: ImageSourcePropType;
  audioSource: any;
}[] = [
  {
    id: 'minnalae',
    title: 'Minnalae Nee Va',
    description: 'Your very first musical confession.',
    imageSource: require('../../assets/images/maymadham.jpg'),
    audioSource: require('../../assets/audios/minnalae-nee-vanthathenadi.aac'),
  },
  {
    id: 'ninaithu',
    title: 'Ninaithu Ninaithu',
    description: 'the same place where memory learns to ache.',
    imageSource: require('../../assets/images/7G.jpg'),
    audioSource: require('../../assets/audios/ninaithu-ninaithu-paarthen.aac'),
  },
  {
    id: 'sundari',
    title: 'Sundari Kannal Oru Sethi',
    description: "When fear whispered you'd leave.",
    imageSource: require('../../assets/images/sundari.jpg'),
    audioSource: require('../../assets/audios/sundari-kannal-oru-sethi.aac'),
  },
  {
    id: 'pottu',
    title: 'Pottu Vaitha Oru Vatta Nila',
    description: 'The song you sang missing me.',
    imageSource: require('../../assets/images/pottuvaitha.jpg'),
    audioSource: require('../../assets/audios/pottu-vaitha-oru-vatta-nila.aac'),
  },
  {
  id: 'Raasathi',
  title: 'Raasathi unna kaanatha nenju',
  description: 'Your heart calling out mine.',
  imageSource: require('../../assets/images/raasathi.jpg'),
  audioSource: require('../../assets/audios/raasathi-unna-kaanatha-nenju.aac'),
  },
  // {
  //   id: 'raasavae',
  //   title: 'Raasavae unna nambi',
  //   description: 'Our love against the world.',
  //   imageSource: require('../../assets/images/mudhalmariyathai.jpg'),
  //   audioSource: require('../../assets/audios/minnalae-nee-vanthathenadi.aac'),
  // },
  {
    id: 'poove',
    title: 'Poove Sempoove',
    description: 'Loving you meant letting go.',
    imageSource: require('../../assets/images/pooveSempoove.jpg'),
    audioSource: require('../../assets/audios/poove-sempoove.aac'),
  },
  {
    id: 'vellai',
    title: 'Vellai pura ondru ',
    description: 'Together, despite our impossible fate.',
    imageSource: require('../../assets/images/vellaipura.jpg'),
    audioSource: require('../../assets/audios/vellai-pura-ondru.aac'),
  },
  {
    id: 'kudagu',
    title: 'Kudagu Malai',
    description: 'Because forgetting you was impossible.',
    imageSource: require('../../assets/images/kudagumalai.jpg'),
    audioSource: require('../../assets/audios/kudagu-malai-kaatril-varum-osai-kekutha.aac'),
  },
];

const chapterThreeRows = [
  [
    { id: 'butterfly-1', label: 'Butterfly Park', imageSource: require('../../assets/images/sundari.jpg') },
    { id: 'butterfly-1', label: 'Butterfly Park', imageSource: require('../../assets/images/pottuvaitha.jpg') },
    { id: 'butterfly-1', label: 'Butterfly Park', imageSource: require('../../assets/images/kudagumalai.jpg') },
    { id: 'butterfly-1', label: 'Butterfly Park', imageSource: require('../../assets/images/maymadham.jpg') },
  ],
  [
    { id: 'wonderla-2', label: 'Wonderla', imageSource: require('../../assets/images/pooveSempoove.jpg') },
    { id: 'wonderla-2', label: 'Wonderla', imageSource: require('../../assets/images/vellaipura.jpg') },
    { id: 'wonderla-2', label: 'Wonderla', imageSource: require('../../assets/images/7G.jpg') },
    { id: 'wonderla-2', label: 'Wonderla', imageSource: require('../../assets/images/mudhalmariyathai.jpg') },
  ],
  [
    { id: 'yercaud-3', label: 'Yercaud', imageSource: require('../../assets/images/sundari.jpg') },
    { id: 'yercaud-3', label: 'Yercaud', imageSource: require('../../assets/images/pottuvaitha.jpg') },
    { id: 'yercaud-3', label: 'Yercaud', imageSource: require('../../assets/images/kudagumalai.jpg') },
    { id: 'yercaud-3', label: 'Yercaud', imageSource: require('../../assets/images/maymadham.jpg') },
  ],
  [
    { id: 'beach-4', label: 'Pondicherry Beach', imageSource: require('../../assets/images/pooveSempoove.jpg') },
    { id: 'beach-4', label: 'Pondicherry Beach', imageSource: require('../../assets/images/vellaipura.jpg') },
    { id: 'beach-4', label: 'Pondicherry Beach', imageSource: require('../../assets/images/7G.jpg') },
    { id: 'beach-4', label: 'Pondicherry Beach', imageSource: require('../../assets/images/mudhalmariyathai.jpg') },
  ],
];

const breakdownBars = [
  { label: 'Love', value: 0.98, tone: 'Transcendent' },
  { label: 'Anger', value: 0.22, tone: 'Passing' },
  { label: 'Hate', value: 0.06, tone: 'None' },
  { label: 'Tears', value: 0.72, tone: 'Healing' },
];

const waitingCalendarDots = [
  1, 10, 12, 16, 19, 23, 27, 31, 34,
];

const goodGameEmojis = ['❤️', '🌸', '🎵', '😂'];
const badGameEmojis = ['⚡', '😡', '😭'];
const fortuneRewards = [
  '🤗 Free Warm Hug',
  '☕ You Owe Me a Coffee',
  '🎵 Sing Our Song',
  '📝 One Poem Please',
  '💃 Dance Together While Drunk',
  '😘 Lick Me',
  '💋 A Deep Kiss',
];
const wheelSize = Math.min(screenWidth - 82, 320);

type FallingItem = {
  id: number;
  emoji: string;
  left: number;
  duration: number;
  points: 1 | -1;
};

type ScoreIndicator = {
  id: number;
  value: 1 | -1;
  left: number;
  top: number;
};

type MemoryPhoto = {
  id: string;
  label: string;
  imageSource: ImageSourcePropType;
};

type SelectedPhoto = MemoryPhoto & {
  frame: { x: number; y: number; width: number; height: number };
};

export default function ChapterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = Number(id ?? '0');
  const chapter = getChapter(numericId);

  if (numericId === 1) {
    return <WhyIFellScreen />;
  }

  if (numericId === 2) {
    return <SongsBetweenSilenceScreen />;
  }

  if (numericId === 3) {
    return <MemoriesWeNeverHadScreen />;
  }

  if (numericId === 4) {
    return <LoveThatSurvivedDistanceScreen />;
  }

  if (numericId === 5) {
    return <FindMeAgainScreen />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#c9d9ed" />
      </Pressable>
      <View style={styles.fallbackWrap}>
        <Text style={styles.fallbackStar}>{'\u2726'}</Text>
        <Text style={styles.fallbackQuote}>{chapter?.quote ?? 'This chapter will be added next.'}</Text>
      </View>
    </SafeAreaView>
  );
}

function WhyIFellScreen() {
  const [openLetter, setOpenLetter] = useState('');
  const envelopeLayouts = [
    { offsetX: -14, tilt: -2.4 },
    { offsetX: 8, tilt: 1.6 },
    { offsetX: -10, tilt: -1.2 },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <NightSky />
      <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#c9d9ed" />
      </Pressable>
      <Text style={styles.chapterTitle}>Why I Fell</Text>
      </View>

      <ScrollView contentContainerStyle={styles.envelopeList} showsVerticalScrollIndicator={false}>
        {chapterOneLetters.map((letter, index) => (
          <EnvelopeCard
            key={letter.title}
            body={letter.body}
            driftDelay={index * 260}
            isOpen={openLetter === letter.title}
            offsetX={envelopeLayouts[index]?.offsetX ?? 0}
            onPress={() => setOpenLetter((current) => (current === letter.title ? '' : letter.title))}
            tilt={envelopeLayouts[index]?.tilt ?? 0}
            title={letter.title}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function SongsBetweenSilenceScreen() {
  const [activeSong, setActiveSong] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <NightSky />
      <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#c9d9ed" />
      </Pressable>
      <Text style={styles.chapterTitle}>Songs Between the Silence</Text>
      </View>
      <Text style={styles.musicIntro}>
        A collection of echoes, designed for the quietest hours of the night.
      </Text>

      <ScrollView contentContainerStyle={styles.musicList} showsVerticalScrollIndicator={false}>
        {chapterTwoSongs.map((song) => (
          <MusicCard
            key={song.id}
            description={song.description}
            imageSource={song.imageSource}
            audioSource={song.audioSource}
            isPlaying={activeSong === song.id}
            onTogglePlay={() => {
              setActiveSong((current) =>
                current === song.id ? null : song.id
              );
            }}
            title={song.title}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function MemoriesWeNeverHadScreen() {
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedPhoto | null>(null);
  const modalProgress = useSharedValue(0);

  useEffect(() => {
    if (selectedPhoto) {
      modalProgress.value = withTiming(1, {
        duration: 460,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      });
      return;
    }

    modalProgress.value = 0;
  }, [modalProgress, selectedPhoto]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(modalProgress.value, [0, 1], [1, 0.22]),
    transform: [{ scale: interpolate(modalProgress.value, [0, 1], [1, 0.98]) }],
  }));

  const closeModal = () => {
    modalProgress.value = withTiming(0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
    setTimeout(() => setSelectedPhoto(null), 260);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <NightSky />
      <Animated.View style={[styles.absoluteFill, contentStyle]}>
        <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#c9d9ed" />
        </Pressable>
        <Text style={styles.chapterTitle}>Memories We Never Had</Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.memoryScrollContent}
          showsVerticalScrollIndicator={false}>
          {chapterThreeRows.map((row, index) => (
            <MemoryPhotoRow
              direction={index % 2 === 0 ? 'ltr' : 'rtl'}
              key={`memory-row-${index}`}
              photos={row}
              speed={15000 + index * 1400}
              topOffset={index}
              onSelect={setSelectedPhoto}
            />
          ))}
        </ScrollView>
      </Animated.View>

      {selectedPhoto ? (
        <MemoryPhotoModal
          modalProgress={modalProgress}
          onClose={closeModal}
          photo={selectedPhoto}
        />
      ) : null}
    </SafeAreaView>
  );
}

function LoveThatSurvivedDistanceScreen() {
  const [activeSong, setActiveSong] = useState<string | null>('null');
  const [, setRevealedCards] = useState({
    bond: false,
    missing: false,
    breakdown: false,
  });
  const cardPositions = useRef<Record<string, number>>({});
  const viewportHeight = screenHeight;

  const revealOnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const bottomEdge = event.nativeEvent.contentOffset.y + viewportHeight;
    setRevealedCards((current) => ({
      bond: current.bond || bottomEdge > (cardPositions.current.bond ?? Number.MAX_SAFE_INTEGER) - 80,
      missing: current.missing || bottomEdge > (cardPositions.current.missing ?? Number.MAX_SAFE_INTEGER) - 80,
      breakdown:
        current.breakdown || bottomEdge > (cardPositions.current.breakdown ?? Number.MAX_SAFE_INTEGER) - 80,
    }));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <NightSky />
      <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#c9d9ed" />
      </Pressable>
      <Text style={styles.chapterTitle}>The Love That Survived Distance</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.dashboardScrollContent}
        onScroll={revealOnScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        <DashboardCard>
          <Text style={styles.dashboardCardTitle}>Love Progress</Text>
          <LoveProgressCard />
        </DashboardCard>

        <DashboardCard
          onLayout={(event) => {
            cardPositions.current.bond = event.nativeEvent.layout.y;
          }}>
          <Text style={styles.dashboardSmallTitle}>Unbreakable Bond</Text>
          <BondChart />
        </DashboardCard>

        <DashboardCard
          onLayout={(event) => {
            cardPositions.current.missing = event.nativeEvent.layout.y;
          }}>
          <Text style={styles.dashboardSmallTitleCenter}>Missing You</Text>
          <MissingYouChart />
        </DashboardCard>

        <DashboardCard
          onLayout={(event) => {
            cardPositions.current.breakdown = event.nativeEvent.layout.y;
          }}>
          <Text style={styles.dashboardSmallTitle}>Emotional Breakdown</Text>
          <BreakdownChart />
        </DashboardCard>

        <DashboardCard>
          <View style={styles.dashboardSoundtrackHeader}>
            <Ionicons name="musical-note" color="#d6b85a" size={16} />
            <Text style={styles.dashboardSmallTitle}>Soundtrack for Survival</Text>
          </View>
          <MusicCard
            description="Our souls met through melodies."
            imageSource={require('../../assets/images/7G.jpg')}
            audioSource={require('../../assets/audios/ninaithu-ninaithu-paarthen.aac')}
            isPlaying={activeSong === 'distance'}
            onTogglePlay={() => setActiveSong((current) => (current === 'distance' ? null : 'distance'))}
            title="Ninaithu Ninaithu Parthal"
          />
        </DashboardCard>

        <DashboardCard>
          <View style={styles.calendarHeader}>
            <Text style={styles.dashboardSmallTitle}>The Waiting Calendar</Text>
            <Text style={styles.calendarCounter}>365 Days &amp; Counting</Text>
          </View>
          <WaitingCalendar />
        </DashboardCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function FindMeAgainScreen() {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'lost' | 'wheel'>('intro');
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [indicators, setIndicators] = useState<ScoreIndicator[]>([]);
  const [selectedReward, setSelectedReward] = useState('');
  const itemCounter = useRef(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const resetGame = () => {
      itemCounter.current = 0;
      setScore(0);
      setWrongCount(0);
      setSpeedMultiplier(1);
      setFallingItems([]);
      setIndicators([]);
      setSelectedReward('');
      setPhase('playing');
    };

    useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.back(); // Go back to the stars page
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );

  useEffect(() => {
    if (phase !== 'playing') return;

    const timer = setInterval(() => {
      setSpeedMultiplier((prev) => Math.min(prev + 0.15, 2));
    }, 4000);

    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') {
      return;
    }

    const spawnTimer = setInterval(() => {
      const isGood = Math.random() > 0.35;
      const source = isGood ? goodGameEmojis : badGameEmojis;
      const emoji = source[Math.floor(Math.random() * source.length)];
      const id = itemCounter.current + 1;
      itemCounter.current = id;

      setFallingItems((current) => [
        ...current,
        {
          id,
          emoji,
          left: 18 + Math.random() * 64,
          duration: (4300 + Math.random() * 1400) / speedMultiplier,
          points: isGood ? 1 : -1,
        },
      ]);
    }, 720);

    return () => clearInterval(spawnTimer);
  }, [phase, speedMultiplier]);

  const removeFallingItem = useCallback((id: number) => {
    setFallingItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const addIndicator = useCallback((value: 1 | -1, left: number, top: number) => {
    const id = Date.now() + Math.random();
    setIndicators((current) => [...current, { id, value, left, top }]);
    setTimeout(() => {
      setIndicators((current) => current.filter((indicator) => indicator.id !== id));
    }, 950);
  }, []);

  const catchEmoji = useCallback((item: FallingItem) => {
    removeFallingItem(item.id);
    addIndicator(item.points, item.left, screenHeight * 0.48);

    if (item.points === 1) {
      setScore((current) => {
        const nextScore = current + 1;
        if (nextScore >= 10) {
          setPhase('wheel');
          setFallingItems([]);
        }
        return nextScore;
      });
      return;
    }

    setScore((current) => Math.max(0, current - 1));
    setWrongCount((current) => {
      const nextWrongCount = current + 1;
      if (nextWrongCount > 5) {
        setPhase('lost');
        setFallingItems([]);
      }
      return nextWrongCount;
    });
  }, [addIndicator, removeFallingItem]);

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <NightSky />
      <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#c9d9ed" />
      </Pressable>
      <Text style={styles.chapterTitle}>Find Me Again</Text>
      </View>
      <View style={styles.scorePill}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>
      {phase === 'playing' ? (
        <Text style={styles.wrongCounter}>misses {wrongCount}/6</Text>
      ) : null}

      {phase === 'intro' ? (
        <FindMeAgainIntro onStart={resetGame} />
      ) : null}

      {phase === 'playing' ? (
        <View style={styles.gameField}>
          {fallingItems.map((item) => (
            <FallingEmoji
              item={item}
              key={item.id}
              onCatch={catchEmoji}
              onMiss={removeFallingItem}
            />
          ))}
          {indicators.map((indicator) => (
            <ScoreFloat key={indicator.id} indicator={indicator} />
          ))}
        </View>
      ) : null}

      {phase === 'lost' ? <TryAgainPopup onRetry={resetGame} /> : null}

      {phase === 'wheel' ? (
        <FortuneWheelPopup
          reward={selectedReward}
          onReward={setSelectedReward}
          onReset={() => setSelectedReward('')}
        />
      ) : null}
    </SafeAreaView>
  );
}

function FindMeAgainIntro({ onStart }: { onStart: () => void }) {
  return (
    <View style={styles.findIntroCard}>
      <Text style={styles.findIntroTitle}>Memory Game</Text>
      <Text style={styles.findIntroCopy}>
        Catch the beautiful memories. Avoid the storms that pull us apart.
      </Text>
      <View style={styles.findRuleLine} />
      <View style={styles.findRulesRow}>
        <View style={styles.findRuleGroup}>
          <Text style={styles.findRuleEmoji}>❤️  🌸</Text>
          <Text style={styles.findRuleGood}>+1</Text>
        </View>
        <View style={styles.findRuleGroup}>
          <Text style={styles.findRuleEmoji}>⚡  😭</Text>
          <Text style={styles.findRuleBad}>-1</Text>
        </View>
      </View>
      <View style={styles.findRuleLine} />
      <Pressable onPress={onStart} style={styles.findStartButton}>
        <Text style={styles.findStartText}>START THE GAME</Text>
      </Pressable>
    </View>
  );
}

function FallingEmoji({
  item,
  onCatch,
  onMiss,
}: {
  item: FallingItem;
  onCatch: (item: FallingItem) => void;
  onMiss: (id: number) => void;
}) {
  const fall = useSharedValue(-60);
  const spin = useSharedValue(0);

  useEffect(() => {
    fall.value = withTiming(screenHeight + 80, {
      duration: item.duration,
      easing: Easing.linear,
    }, (finished) => {
      if (finished) {
        runOnJS(onMiss)(item.id);
      }
    });
    spin.value = withRepeat(
      withTiming(1, {
        duration: 1800,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, [fall, item.duration, item.id, onMiss, spin]);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: fall.value },
      { rotate: `${interpolate(spin.value, [0, 1], [-8, 8])}deg` },
      { scale: interpolate(spin.value, [0, 1], [0.95, 1.08]) },
    ],
  }));

  return (
    <Animated.View style={[styles.fallingEmojiWrap, { left: `${item.left}%` }, emojiStyle]}>
      <Pressable onPress={() => onCatch(item)} hitSlop={18}>
        <Text style={styles.fallingEmoji}>{item.emoji}</Text>
      </Pressable>
    </Animated.View>
  );
}

function ScoreFloat({ indicator }: { indicator: ScoreIndicator }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.2, 1], [0, 1, 0]),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [0, -38]) }],
  }));

  return (
    <Animated.Text
      style={[
        styles.scoreFloat,
        indicator.value > 0 ? styles.scoreFloatGood : styles.scoreFloatBad,
        { left: `${indicator.left}%`, top: indicator.top },
        style,
      ]}>
      {indicator.value > 0 ? '+1' : '-1'}
    </Animated.Text>
  );
}

function TryAgainPopup({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.popupBackdrop}>
      <View style={styles.modalBlurTint} />
      <View style={styles.tryAgainCard}>
        <Text style={styles.tryAgainHeart}>❤️</Text>
        <Text style={styles.tryAgainTitle}>Even love deserves another chance 😘</Text>
        <Pressable onPress={onRetry} style={styles.tryAgainButton}>
          <Text style={styles.tryAgainButtonText}>LET&apos;S TRY AGAIN</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FortuneWheelPopup({
  reward,
  onReward,
  onReset,
}: {
  reward: string;
  onReward: (reward: string) => void;
  onReset: () => void;
}) {
  const rotation = useSharedValue(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showFinalReward, setShowFinalReward] = useState(false);

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const spinWheel = () => {
    if (isSpinning || reward) {
      return;
    }

    setIsSpinning(true);
    const rewardIndex = Math.floor(Math.random() * fortuneRewards.length);
    const segmentSize = 360 / fortuneRewards.length;

    const targetRotation = 360 * 5 - rewardIndex * segmentSize;

    rotation.value = withTiming(targetRotation, {
      duration: 3600,
      easing: Easing.out(Easing.cubic),
    }, () => {
      runOnJS(onReward)(fortuneRewards[rewardIndex]);
      runOnJS(setIsSpinning)(false);
    });
  };

  return (
    <View style={styles.popupBackdrop}>
      <View style={styles.modalBlurTint} />
      <Text style={styles.wheelTitle}>Fortune Wheel</Text>
      <View style={styles.wheelShell}>
        <View style={styles.wheelPointer} />
        <Animated.View style={[styles.wheel, wheelStyle]}>
          {fortuneRewards.map((item, index) => (
            <View
              key={item}
              style={[
                styles.wheelSegment,
                {
                  transform: [
                    {
                      rotate: `${(360 / fortuneRewards.length) * index}deg`,
                    },
                  ]
                },
              ]}>
              <Text style={styles.wheelSegmentText}>{item.replace(/^.\s/u, '').toUpperCase()}</Text>
            </View>
          ))}
        </Animated.View>
        <Pressable onPress={spinWheel} style={styles.spinButton}>
          <Text style={styles.spinButtonText}>{isSpinning ? '...' : 'SPIN'}</Text>
        </Pressable>
      </View>

      {reward && !showFinalReward ? (
        <FatePopup reward={reward} onAccept={() => setShowFinalReward(true)} />
      ) : null}

      {showFinalReward ? (
        <FinalRewardPopup
          reward={reward}
          onTryAgain={() => {
          setShowFinalReward(false);
          onReset();
          rotation.value = 0;

        }}
        />
      ) : null}
    </View>
  );
}

function FatePopup({
  reward,
  onAccept,
}: {
  reward: string;
  onAccept: () => void;
}) {
  return (
    <View style={styles.popupBackdrop}>
      <View style={styles.fateCard}>
        <Text style={styles.rewardTitle}>Your Fate!</Text>

        <Text style={styles.rewardText}>{reward}</Text>

        <Text style={styles.rewardHint}>
          Complete it, then your babe can reveal the surprise gift.
        </Text>

        <Pressable onPress={onAccept} style={styles.rewardButton}>
          <Text style={styles.rewardButtonText}>ACCEPT</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FinalRewardPopup({
  reward,
  onTryAgain,
}: {
  reward: string;
  onTryAgain: () => void;
}) {
  return (
    <View style={styles.finalRewardCard}>
      <Text style={styles.finalRewardKicker}>
        Your next little adventure begins now.
      </Text>

      <LinearGradient
        colors={['rgba(75, 102, 132, 0.82)', 'rgba(31, 66, 99, 0.72)']}
        style={styles.finalRewardPanel}>
        <Text style={styles.finalRewardSparkle}>{'\u2726'}</Text>

        <Text style={styles.finalRewardTitle}>
          Reward Unlocked!
        </Text>

        <Text style={styles.finalRewardReward}>
          {reward}
        </Text>
      </LinearGradient>

      <Text style={styles.finalRewardCopy}>
        To be claimed whenever the moment feels just right.
      </Text>

      <Pressable
        onPress={onTryAgain}
        style={styles.finalRewardButton}>
        <Text style={styles.finalRewardButtonText}>
          Try Again
        </Text>
      </Pressable>
    </View>
  );
}

function NightSky() {
  return (
    <View pointerEvents="none" style={styles.starField}>
      {nightSkyDots.map((star) => (
        <View
          key={star.id}
          style={[
            styles.starDot,
            {
              backgroundColor: star.color,
              height: star.size,
              left: `${star.left}%`,
              opacity: star.opacity,
              top: `${star.top}%`,
              width: star.size,
            },
          ]}
        />
      ))}
    </View>
  );
}

function MemoryPhotoRow({
  photos,
  direction,
  speed,
  topOffset,
  onSelect,
}: {
  photos: MemoryPhoto[];
  direction: 'ltr' | 'rtl';
  speed: number;
  topOffset: number;
  onSelect: (photo: SelectedPhoto) => void;
}) {
  const travel = useSharedValue(0);
  const tripledPhotos = useMemo(() => [...photos, ...photos, ...photos], [photos]);
  const rowDistance = photos.length * (PHOTO_CARD_WIDTH + PHOTO_CARD_GAP);

  useEffect(() => {
    travel.value = withRepeat(
      withTiming(1, {
        duration: speed,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [direction, speed, travel]);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          travel.value,
          [0, 1],
          direction === 'ltr' ? [-rowDistance, 0] : [0, -rowDistance]
        ),
      },
    ],
  }));

  return (
    <View style={styles.memoryRowWrap}>
      <View style={styles.memoryStringLine} />
      <Animated.View style={[styles.memoryTrack, rowStyle]}>
        {tripledPhotos.map((photo, index) => (
          <HangingPhotoCard
            index={index}
            key={`${photo.id}-${index}`}
            photo={photo}
            topOffset={topOffset}
            onSelect={onSelect}
          />
        ))}
      </Animated.View>
    </View>
  );
}

function HangingPhotoCard({
  photo,
  index,
  topOffset,
  onSelect,
}: {
  photo: MemoryPhoto;
  index: number;
  topOffset: number;
  onSelect: (photo: SelectedPhoto) => void;
}) {
  const frameRef = useRef<View>(null);
  const tilt = [-2.2, 1.6, -1.4, 2.1][(index + topOffset) % 4];
  const drop = [18, 32, 8, 24][(index + topOffset) % 4];

  return (
    <View style={[styles.memoryItemShell, { paddingTop: drop }]}>
      <View style={styles.memoryClip} />
      <View style={styles.memoryHook} />
      <View ref={frameRef} style={{ transform: [{ rotate: `${tilt}deg` }] }}>
        <Pressable
          onPress={() => {
            frameRef.current?.measureInWindow((x, y, width, height) => {
              onSelect({
                ...photo,
                frame: { x, y, width, height },
              });
            });
          }}
          style={styles.memoryPhotoFrame}>
          <Image source={photo.imageSource} style={styles.memoryPhotoImage} />
        </Pressable>
      </View>
    </View>
  );
}

type SharedNumber = ReturnType<typeof useSharedValue<number>>;
function MemoryPhotoModal({
  photo,
  modalProgress,
  onClose,
}: {
  photo: SelectedPhoto;
  modalProgress: SharedNumber;
  onClose: () => void;
}) {
  const targetWidth = screenWidth * 0.76;
  const targetHeight = targetWidth * 1.28;
  const targetX = (screenWidth - targetWidth) / 2;
  const targetY = screenHeight * 0.19;

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(modalProgress.value, [0, 1], [0, 1]),
  }));

  const popupStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(modalProgress.value, [0, 1], [10, 20]),
    height: interpolate(modalProgress.value, [0, 1], [photo.frame.height, targetHeight]),
    left: interpolate(modalProgress.value, [0, 1], [photo.frame.x, targetX]),
    top: interpolate(modalProgress.value, [0, 1], [photo.frame.y, targetY]),
    transform: [
      { rotate: `${interpolate(modalProgress.value, [0, 1], [2.2, 0])}deg` },
      { scale: interpolate(modalProgress.value, [0, 1], [1, 1.02]) },
    ],
    width: interpolate(modalProgress.value, [0, 1], [photo.frame.width, targetWidth]),
  }));

  const captionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(modalProgress.value, [0.5, 1], [0, 1]),
    transform: [{ translateY: interpolate(modalProgress.value, [0.5, 1], [16, 0]) }],
  }));

  return (
    <View style={styles.absoluteFill}>
      <Pressable onPress={onClose} style={styles.absoluteFill}>
        <Animated.View style={[styles.memoryBackdrop, backdropStyle]} />
      </Pressable>
      <Animated.View style={[styles.memoryPopupFrame, popupStyle]}>
        <Image source={photo.imageSource} style={styles.memoryPopupImage} />
      </Animated.View>
      <Animated.View style={[styles.memoryPopupCaptionWrap, captionStyle]}>
        <Text style={styles.memoryPopupTitle}>{photo.label}</Text>
        <Text style={styles.memoryPopupSubtitle}>A memory we are still waiting to live.</Text>
      </Animated.View>
    </View>
  );
}

function DashboardCard({
  children,
  onLayout,
}: {
  children: ReactNode;
  onLayout?: (event: any) => void;
}) {
  return (
    <View onLayout={onLayout} style={styles.dashboardCard}>
      {children}
    </View>
  );
}

function LoveProgressCard() {
  return (
    <View style={styles.loveProgressWrap}>
      <View style={styles.loveProgressTopRow}>
        <Ionicons name="heart" color="#f2cb55" size={26} />

        <View style={styles.arcDotsWrap}>
          {[6, 18, 32, 46, 60, 74, 86].map((left, index) => (
            <View
              key={index}
              style={[
                styles.arcDot,
                {
                  left: `${left}%`,
                  top: [24, 18, 14, 12, 14, 18, 24][index],
                },
              ]}
            />
          ))}
        </View>

        <Ionicons name="heart" color="#f2cb55" size={26} />
      </View>

      <Text style={styles.infinitySymbol}>∞</Text>
      <Text style={styles.foreverConstant}>Forever Constant</Text>
    </View>
  );
}

function BondChart() {
  return (
    <View style={styles.bondChart}>
      <View style={styles.chartGridLineTop} />
      <View style={styles.chartGridLineMid} />

      <View
        style={{
          position: 'absolute',
          left: 16,
          bottom: 100,
          width: 290,
          height: 2,
          backgroundColor: '#d4b24a',
          borderRadius: 3,
          transform: [{ rotate: '-18deg' }],
        }}
      />

      <Text style={styles.bondChartLabel}>
        Rising Resilience
      </Text>
    </View>
  );
}

function MissingYouChart() {
  return (
    <View style={styles.missingYouWrap}>
      <View style={styles.donutTrack} />
      <View style={styles.donutRing} />
      <View style={styles.donutGlow} />

      <View style={styles.donutCenter}>
        <Text style={styles.donutCenterWord}>
          Always
        </Text>
      </View>

      <Text style={styles.donutBottomLabel}>
        100% Intensity
      </Text>
    </View>
  );
}

function BreakdownChart() {
  return (
    <View style={styles.breakdownWrap}>
      {breakdownBars.map((bar, index) => (
        <View key={bar.label} style={styles.breakdownRow}>
          <View style={styles.breakdownRowHead}>
            <Text style={styles.breakdownLabel}>
              {bar.label}
            </Text>

            <Text
              style={[
                styles.breakdownTone,
                index === 0 && styles.breakdownToneGold,
              ]}>
              {bar.tone}
            </Text>
          </View>

          <View style={styles.breakdownTrack}>
            <View
              style={[
                styles.breakdownFill,
                {
                  width: `${bar.value * 100}%`,
                },
                index === 0 && styles.breakdownFillGold,
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function WaitingCalendar() {
  return (
    <View>
      <View style={styles.calendarGrid}>
        {Array.from({ length: 35 }, (_, index) => (
          <View key={`day-${index}`} style={styles.calendarCell}>
            {waitingCalendarDots.includes(index) ? <View style={styles.calendarGlowDot} /> : null}
          </View>
        ))}
      </View>
      <View style={styles.calendarLegend}>
        <View style={styles.calendarCell}></View>
        <Text style={styles.calendarLegendText}>Ordinary Day</Text>
        <View style={styles.calendarLegendDot} />
        <Text style={styles.calendarLegendText}>Meaningful Reminder</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#031a31',
    flex: 1,
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  starField: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#031a31',
    opacity: 0.98,
  },
  starDot: {
    borderRadius: 4,
    position: 'absolute',
  },
  header: {
    position: 'absolute',
    top: 12,
    left: 8,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    padding: 10,
  },
  chapterTitle: {
    marginLeft: 0,
    color: '#c9d9ed',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 16,
  },
  envelopeList: {
    paddingBottom: 96,
    paddingLeft: 46,
    paddingRight: 30,
    paddingTop: 108,
  },
  musicIntro: {
    color: '#d6b85a',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 16,
    lineHeight: 32,
    marginHorizontal: 28,
    marginTop: 50,
  },
  musicList: {
    gap: 18,
    paddingBottom: 36,
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  memoryScrollContent: {
    paddingBottom: 64,
    paddingTop: 84,
  },
  memoryRowWrap: {
    height: 182,
    justifyContent: 'flex-start',
    marginBottom: 58,
    overflow: 'hidden',
  },
  memoryStringLine: {
    backgroundColor: '#bfa64c',
    height: 2,
    left: 0,
    opacity: 0.95,
    position: 'absolute',
    right: 0,
    top: 16,
  },
  memoryTrack: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: PHOTO_CARD_GAP,
    paddingHorizontal: 18,
  },
  memoryItemShell: {
    alignItems: 'center',
    width: PHOTO_CARD_WIDTH,
  },
  memoryClip: {
    backgroundColor: '#d8b74c',
    borderRadius: 2,
    height: 16,
    position: 'absolute',
    top: 18,
    width: 10,
    zIndex: 4,
  },
  memoryHook: {
    backgroundColor: '#bfa64c',
    height: 16,
    position: 'absolute',
    top: 2,
    width: 1,
    zIndex: 3,
  },
  memoryPhotoFrame: {
    backgroundColor: '#14365b',
    borderColor: 'rgba(193, 212, 236, 0.16)',
    borderRadius: 4,
    borderWidth: 1,
    elevation: 4,
    height: PHOTO_CARD_HEIGHT,
    padding: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    width: PHOTO_CARD_WIDTH,
  },
  memoryPhotoImage: {
    borderRadius: 1,
    height: '100%',
    width: '100%',
  },
  memoryBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 9, 18, 0.82)',
  },
  memoryPopupFrame: {
    backgroundColor: '#17395b',
    borderColor: 'rgba(233, 243, 255, 0.18)',
    borderWidth: 1,
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: '#000000',
    shadowOpacity: 0.32,
    shadowRadius: 18,
  },
  memoryPopupImage: {
    height: '100%',
    width: '100%',
  },
  memoryPopupCaptionWrap: {
    alignItems: 'center',
    left: 30,
    position: 'absolute',
    right: 30,
    top: screenHeight * 0.72,
  },
  memoryPopupTitle: {
    color: '#f4f6fb',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 22,
    fontStyle: 'italic',
  },
  memoryPopupSubtitle: {
    color: '#c9d4e3',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  dashboardScrollContent: {
    paddingBottom: 36,
    paddingHorizontal: 18,
    paddingTop: 74,
  },
  dashboardCard: {
    backgroundColor: 'rgba(12, 42, 70, 0.94)',
    borderColor: 'rgba(181, 204, 230, 0.12)',
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#081b32',
    shadowOpacity: 0.3,
    shadowRadius: 14,
  },
  dashboardCardTitle: {
    color: '#d7b852',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  dashboardSmallTitle: {
    color: '#dce6f4',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 9,
  },
  dashboardSmallTitleCenter: {
    color: '#dce6f4',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  loveProgressWrap: {
    alignItems: 'center',
    minHeight: 124,
  },
  loveProgressTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    width: '100%',
  },
  glowHeartWrap: {
    width: 32,
  },
  arcDotsWrap: {
    height: 46,
    marginTop: 8,
    width: 120,
  },
  arcDot: {
    backgroundColor: '#d3b452',
    borderRadius: 3,
    height: 4,
    position: 'absolute',
    width: 4,
  },
  infinitySymbol: {
    color: '#dce7f5',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 28,
    marginTop: 4,
  },
  foreverConstant: {
    color: '#d3b452',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 12,
    marginTop: 10,
  },
  bondChart: {
    height: 154,
    justifyContent: 'flex-end',
    marginBottom: 6,
    overflow: 'hidden',
    paddingBottom: 24,
    position: 'relative',
  },
  chartGridLineTop: {
    backgroundColor: 'rgba(164, 184, 208, 0.08)',
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 36,
  },
  chartGridLineMid: {
    backgroundColor: 'rgba(164, 184, 208, 0.06)',
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 76,
  },
  bondSegment: {
    backgroundColor: '#d2af45',
    borderRadius: 2,
    height: 3,
    position: 'absolute',
  },
  bondPoint: {
    backgroundColor: '#e7c760',
    borderRadius: 4,
    height: 7,
    marginLeft: -3,
    position: 'absolute',
    shadowColor: '#e7c760',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    width: 7,
  },
  bondChartLabel: {
    color: '#dce6f4',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 14,
    textAlign: 'center',
  },
  missingYouWrap: {
    alignItems: 'center',
    height: 132,
    justifyContent: 'center',
  },
  donutTrack: {
    borderColor: 'rgba(207, 218, 235, 0.14)',
    borderRadius: 38,
    borderWidth: 7,
    height: 76,
    position: 'absolute',
    width: 76,
  },
  donutRing: {
    borderColor: '#d4b24a',
    borderRadius: 38,
    borderWidth: 7,
    height: 76,
    position: 'absolute',
    width: 76,
  },
  donutGlow: {
    borderColor: 'rgba(214, 184, 87, 0.25)',
    borderRadius: 42,
    borderWidth: 11,
    height: 84,
    position: 'absolute',
    width: 84,
  },
  donutCenter: {
    alignItems: 'center',
    backgroundColor: '#0c2a46',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  donutCenterWord: {
    color: '#d8dde8',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 12,
    fontStyle: 'normal',
  },
  donutBottomLabel: {
    color: '#d4b24a',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 12,
    marginTop: 106,
    position: 'absolute',
    fontWeight: '600',
  },
  breakdownWrap: {
    gap: 14,
    paddingBottom: 6,
  },
  breakdownRow: {
    gap: 6,
  },
  breakdownRowHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    color: '#e2eaf5',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 13,
  },
  breakdownTone: {
    color: '#9ab0c7',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 12,
  },
  breakdownToneGold: {
    color: '#d4b24a',
  },
  breakdownTrack: {
    backgroundColor: 'rgba(182, 198, 216, 0.13)',
    borderRadius: 999,
    height: 5,
    overflow: 'hidden',
  },
  breakdownFill: {
    backgroundColor: '#5f7590',
    borderRadius: 999,
    height: '100%',
  },
  breakdownFillGold: {
    backgroundColor: '#d4b24a',
  },
  dashboardSoundtrackHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarCounter: {
    color: '#d4b24a',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 13,
    maxWidth: 88,
    textAlign: 'right',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  calendarCell: {
    alignItems: 'center',
    backgroundColor: 'rgba(184, 200, 220, 0.08)',
    borderRadius: 2,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  calendarGlowDot: {
    backgroundColor: '#d4b24a',
    borderRadius: 2,
    height: 4,
    shadowColor: '#d4b24a',
    shadowOpacity: 0.75,
    shadowRadius: 8,
    width: 4,
  },
  calendarLegend: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 14,
  },
  calendarLegendDot: {
    backgroundColor: '#d4b24a',
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  calendarLegendText: {
    color: '#8ea4be',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 10,
  },
  scorePill: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 48, 76, 0.82)',
    borderColor: 'rgba(213, 190, 86, 0.22)',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 11,
    height: 46,
    justifyContent: 'center',
    position: 'absolute',
    right: 18,
    top: 18,
    width: 136,
    zIndex: 7,
  },
  scoreLabel: {
    color: '#d5b64f',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  scoreValue: {
    color: '#e6c65d',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 18,
    fontWeight: '800',
  },
  wrongCounter: {
    color: '#7f98b3',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 12,
    fontWeight: '700',
    position: 'absolute',
    right: 34,
    top: 66,
    zIndex: 7,
  },
  findIntroCard: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(23, 54, 85, 0.78)',
    borderColor: 'rgba(174, 202, 230, 0.16)',
    borderRadius: 34,
    borderWidth: 1,
    marginTop: screenHeight * 0.32,
    paddingHorizontal: 28,
    paddingVertical: 34,
    shadowColor: '#6bbdff',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    width: Math.min(screenWidth - 54, 388),
  },
  findIntroTitle: {
    color: '#9fb5d4',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  findIntroCopy: {
    color: '#c8d1df',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 28,
    textAlign: 'center',
  },
  findRuleLine: {
    backgroundColor: 'rgba(170, 197, 225, 0.08)',
    height: 1,
    marginVertical: 20,
    width: '100%',
  },
  findRulesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '88%',
  },
  findRuleGroup: {
    alignItems: 'center',
    gap: 10,
  },
  findRuleEmoji: {
    fontSize: 26,
  },
  findRuleGood: {
    color: '#a8c5ff',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 18,
    fontWeight: '800',
  },
  findRuleBad: {
    color: '#e19a9a',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 18,
    fontWeight: '800',
  },
  findStartButton: {
    alignItems: 'center',
    backgroundColor: '#a8c2ff',
    borderRadius: 28,
    height: 62,
    justifyContent: 'center',
    shadowColor: '#8fb5ff',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    width: '100%',
  },
  findStartText: {
    color: '#17345f',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  gameField: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    top: 74,
  },
  fallingEmojiWrap: {
    position: 'absolute',
    top: 0,
    zIndex: 5,
  },
  fallingEmoji: {
    fontSize: 34,
    textShadowColor: 'rgba(255,255,255,0.28)',
    textShadowRadius: 10,
  },
  scoreFloat: {
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 18,
    fontWeight: '800',
    position: 'absolute',
    zIndex: 8,
  },
  scoreFloatGood: {
    color: '#d4b24a',
  },
  scoreFloatBad: {
    color: '#e19a9a',
  },
  popupBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(2, 11, 22, 0.72)',
    justifyContent: 'center',
    zIndex: 20,
  },
  modalBlurTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(132, 160, 190, 0.07)',
  },
  tryAgainCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(78, 94, 112, 0.68)',
    borderColor: 'rgba(202, 222, 246, 0.14)',
    borderRadius: 34,
    borderWidth: 1,
    paddingHorizontal: 34,
    paddingVertical: 36,
    width: Math.min(screenWidth - 72, 334),
  },
  tryAgainHeart: {
    fontSize: 48,
    marginBottom: 28,
  },
  tryAgainTitle: {
    color: '#e1e9f7',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 30,
    textAlign: 'center',
  },
  tryAgainSubtitle: {
    color: '#b8c2d0',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
  },
  tryAgainButton: {
    alignItems: 'center',
    backgroundColor: '#a8c2ff',
    borderRadius: 28,
    height: 58,
    justifyContent: 'center',
    marginTop: 34,
    width: '100%',
  },
  tryAgainButtonText: {
    color: '#17345f',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  wheelTitle: {
    color: '#f0c941',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 28,
    fontWeight: '800',
    position: 'absolute',
    textAlign: 'center',
    top: 150,
    width: '100%',
  },
  wheelShell: {
    alignItems: 'center',
    height: wheelSize + 72,
    justifyContent: 'center',
    marginTop: -92,
    width: wheelSize + 36,
  },
  wheelPointer: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 16,
    borderRightColor: 'transparent',
    borderRightWidth: 16,
    borderTopColor: '#f0c941',
    borderTopWidth: 30,
    height: 0,
    position: 'absolute',
    top: 20,
    width: 0,
    zIndex: 7,
  },
  wheel: {
    alignItems: 'center',
    backgroundColor: 'rgba(12, 39, 67, 0.96)',
    borderColor: 'rgba(218, 196, 91, 0.36)',
    borderRadius: wheelSize / 2,
    borderWidth: 3,
    height: wheelSize,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#6bbdff',
    shadowOpacity: 0.18,
    shadowRadius: 28,
    width: wheelSize,
  },
  wheelSegment: {
    alignItems: 'center',
    height: wheelSize,
    justifyContent: 'flex-start',
    paddingTop: 26,
    position: 'absolute',
    width: 92,
  },
  wheelSegmentText: {
    color: '#dfe8f4',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 13,
    textAlign: 'center',
    width: 86,
  },
  spinButton: {
    alignItems: 'center',
    backgroundColor: '#e8c439',
    borderRadius: 54,
    height: 108,
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#e8c439',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    width: 108,
    zIndex: 6,
  },
  spinButtonText: {
    color: '#3b3212',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2.2,
  },
  fateCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(11, 39, 66, 0.9)',
    borderColor: 'rgba(184, 211, 239, 0.14)',
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 28,
    paddingVertical: 30,
    position: 'absolute',
    top: screenHeight * 0.38,
    width: Math.min(screenWidth - 96, 300),
    zIndex: 10,
  },
  rewardTitle: {
    color: '#f0c941',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
  },
  rewardText: {
    color: '#86c8e6',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  rewardHint: {
    color: '#b8c8da',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 18,
    textAlign: 'center',
  },
  rewardButton: {
    alignItems: 'center',
    backgroundColor: '#a8c2ff',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginTop: 26,
    width: 132,
  },
  rewardButtonText: {
    color: '#17345f',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 15,
    fontWeight: '900',
  },
  finalRewardCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(7, 32, 57, 0.92)',
    borderColor: 'rgba(166, 202, 233, 0.18)',
    borderRadius: 34,
    borderWidth: 1,
    paddingHorizontal: 28,
    paddingVertical: 34,
    position: 'absolute',
    shadowColor: '#6bbdff',
    shadowOpacity: 0.18,
    shadowRadius: 28,
    width: Math.min(screenWidth - 46, 382),
    zIndex: 14,
  },
  finalRewardKicker: {
    color: '#86c8e6',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 1.1,
    lineHeight: 28,
    marginBottom: 28,
    textAlign: 'center',
  },
  finalRewardPanel: {
    alignItems: 'center',
    borderColor: 'rgba(236, 210, 91, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 150,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    width: '86%',
  },
  finalRewardSparkle: {
    color: '#f0c941',
    fontSize: 34,
    marginBottom: 12,
    textShadowColor: '#f0c941',
    textShadowRadius: 18,
  },
  finalRewardTitle: {
    color: '#f0c941',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 26,
    fontStyle: 'italic',
    fontWeight: '800',
    textAlign: 'center',
  },
  finalRewardReward: {
    color: '#dce8f6',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
    marginTop: 14,
    textAlign: 'center',
  },
  finalRewardCopy: {
    color: '#c8d1df',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
    marginTop: 34,
    textAlign: 'center',
  },
  finalRewardButton: {
    alignItems: 'center',
    backgroundColor: '#085fbd',
    borderRadius: 29,
    height: 58,
    justifyContent: 'center',
    marginTop: 34,
    shadowColor: '#0b7fff',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    width: '100%',
  },
  finalRewardButtonText: {
    color: '#dbeaff',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  fallbackWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  fallbackStar: {
    color: '#ffd85d',
    fontSize: 52,
    textShadowColor: '#ffd85d',
    textShadowRadius: 20,
  },
  fallbackQuote: {
    color: '#b7c6db',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 17,
    fontStyle: 'italic',
    lineHeight: 28,
    marginTop: 14,
    textAlign: 'center',
  },
});
