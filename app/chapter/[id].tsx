import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  type ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { getChapter } from '@/components/story/chapter-data';
import { EnvelopeCard } from '@/components/story/envelope-card';
import { MusicCard } from '@/components/story/music-card';
import { STORY_FONT_FAMILY } from '@/constants/typography';

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
    body: 'Placeholder paragraph. This letter can hold the tiny moments that made laughter feel softer, safer, and strangely like home.',
  },
  {
    title: 'Your Smile',
    body: 'Placeholder paragraph. This letter can hold the kind of smile that lingers after the moment passes and keeps glowing in memory.',
  },
  {
    title: 'The Way You Were',
    body: 'Placeholder paragraph. This letter can hold the quiet details, the gentleness, and the version of you that kept staying with me.',
  },
];

const chapterTwoSongs: {
  id: string;
  title: string;
  description: string;
  imageSource: ImageSourcePropType;
}[] = [
  {
    id: 'sundari',
    title: 'Sundari Kannal Oru Sethi',
    description: 'Placeholder description for a song that opens like a love letter written in rain.',
    imageSource: require('../../assets/images/sundari.jpg'),
  },
  {
    id: 'ninaithu',
    title: 'Ninaithu Ninaithu',
    description: 'Placeholder description for a song that lingers in the same place where memory learns to ache.',
    imageSource: require('../../assets/images/7G.jpg'),
  },
  {
    id: 'poove',
    title: 'Poove Sempoove',
    description: 'Placeholder description for a song that feels like a bloom opening inside a midnight silence.',
    imageSource: require('../../assets/images/pooveSempoove.jpg'),
  },
  {
    id: 'kudagu',
    title: 'Kudagu Malai',
    description: 'Placeholder description for a song that carries mist, distance, and a slow heart behind it.',
    imageSource: require('../../assets/images/kudagumalai.jpg'),
  },
  {
    id: 'pottu',
    title: 'Pottu Vaitha Oru Vatta Nila',
    description: 'Placeholder description for a song shaped like moonlight touching water in complete stillness.',
    imageSource: require('../../assets/images/pottuvaitha.jpg'),
  },
  {
    id: 'minnalae',
    title: 'Minnalae Nee Va',
    description: 'Placeholder description for a song that arrives like a sudden flash and leaves the night changed.',
    imageSource: require('../../assets/images/maymadham.jpg'),
  },
];

const chapterThreeRows = [
  [
    { id: 'butterfly-1', label: 'Butterfly Park', imageSource: require('../../assets/images/sundari.jpg') },
    { id: 'wonderla-1', label: 'Wonderla', imageSource: require('../../assets/images/pottuvaitha.jpg') },
    { id: 'yercaud-1', label: 'Yercaud', imageSource: require('../../assets/images/kudagumalai.jpg') },
    { id: 'beach-1', label: 'Beach', imageSource: require('../../assets/images/maymadham.jpg') },
  ],
  [
    { id: 'butterfly-2', label: 'Butterfly Park', imageSource: require('../../assets/images/pooveSempoove.jpg') },
    { id: 'wonderla-2', label: 'Wonderla', imageSource: require('../../assets/images/vellaipura.jpg') },
    { id: 'yercaud-2', label: 'Yercaud', imageSource: require('../../assets/images/7G.jpg') },
    { id: 'beach-2', label: 'Beach', imageSource: require('../../assets/images/mudhalmariyathai.jpg') },
  ],
  [
    { id: 'butterfly-3', label: 'Butterfly Park', imageSource: require('../../assets/images/sundari.jpg') },
    { id: 'wonderla-3', label: 'Wonderla', imageSource: require('../../assets/images/pottuvaitha.jpg') },
    { id: 'yercaud-3', label: 'Yercaud', imageSource: require('../../assets/images/kudagumalai.jpg') },
    { id: 'beach-3', label: 'Beach', imageSource: require('../../assets/images/maymadham.jpg') },
  ],
  [
    { id: 'butterfly-4', label: 'Butterfly Park', imageSource: require('../../assets/images/pooveSempoove.jpg') },
    { id: 'wonderla-4', label: 'Wonderla', imageSource: require('../../assets/images/vellaipura.jpg') },
    { id: 'yercaud-4', label: 'Yercaud', imageSource: require('../../assets/images/7G.jpg') },
    { id: 'beach-4', label: 'Beach', imageSource: require('../../assets/images/mudhalmariyathai.jpg') },
  ],
];

const bondChartPoints = [
  { x: 0.06, y: 0.74 },
  { x: 0.2, y: 0.7 },
  { x: 0.38, y: 0.58 },
  { x: 0.58, y: 0.38 },
  { x: 0.72, y: 0.26 },
  { x: 0.9, y: 0.12 },
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
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#c9d9ed" />
      </Pressable>
      <Text style={styles.chapterTitle}>Why I Fell</Text>

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
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#c9d9ed" />
      </Pressable>
      <Text style={styles.musicHeader}>Songs Between the Silence</Text>
      <Text style={styles.musicIntro}>
        A collection of echoes, designed for the quietest hours of the night. Where the melody meets the memory.
      </Text>

      <ScrollView contentContainerStyle={styles.musicList} showsVerticalScrollIndicator={false}>
        {chapterTwoSongs.map((song) => (
          <MusicCard
            key={song.id}
            description={song.description}
            imageSource={song.imageSource}
            isPlaying={activeSong === song.id}
            onTogglePlay={() => setActiveSong((current) => (current === song.id ? null : song.id))}
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
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#c9d9ed" />
        </Pressable>
        <Text style={styles.chapterTitle}>Memories We Never Had</Text>

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
  const [activeSong, setActiveSong] = useState<string | null>('distance');
  const [revealedCards, setRevealedCards] = useState({
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
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#c9d9ed" />
      </Pressable>
      <Text style={styles.chapterTitle}>The Love That Survived Distance</Text>

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
            description="A night we survived one note at a time."
            imageSource={require('../../assets/images/7G.jpg')}
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
  backButton: {
    left: 8,
    padding: 10,
    position: 'absolute',
    top: 12,
    zIndex: 8,
  },
  chapterTitle: {
    color: '#cfd9eb',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 18,
    left: 56,
    position: 'absolute',
    top: 24,
    zIndex: 7,
  },
  envelopeList: {
    paddingBottom: 96,
    paddingLeft: 46,
    paddingRight: 30,
    paddingTop: 108,
  },
  musicHeader: {
    color: '#93a4bb',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 18,
    left: 56,
    position: 'absolute',
    top: 24,
    zIndex: 7,
  },
  musicIntro: {
    color: '#c9d3e1',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 18,
    lineHeight: 32,
    marginHorizontal: 28,
    marginTop: 78,
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
    marginBottom: 12,
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
