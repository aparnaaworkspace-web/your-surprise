import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EnvelopeCard } from '@/components/story/envelope-card';
import { getChapter } from '@/components/story/chapter-data';
import { MusicCard } from '@/components/story/music-card';
import { STORY_FONT_FAMILY } from '@/constants/typography';

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
      <View style={styles.starField} />
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
            offsetX={envelopeLayouts[index]?.offsetX ?? 0}
            isOpen={openLetter === letter.title}
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
      <View style={styles.starField} />
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
            onTogglePlay={() =>
              setActiveSong((current) => (current === song.id ? null : song.id))
            }
            title={song.title}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#031a31',
    flex: 1,
  },
  starField: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#031a31',
    opacity: 0.98,
  },
  backButton: {
    left: 8,
    padding: 10,
    position: 'absolute',
    top: 12,
    zIndex: 5,
  },
  chapterTitle: {
    color: '#cfd9eb',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 18,
    left: 56,
    position: 'absolute',
    top: 24,
    zIndex: 4,
  },
  verticalTitle: {
    color: '#cfd9eb',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 28,
    left: -48,
    letterSpacing: 1,
    position: 'absolute',
    top: 176,
    transform: [{ rotate: '-90deg' }],
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
    zIndex: 4,
  },
  musicIntro: {
    color: '#c9d3e1',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 18,
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
  fallbackTitle: {
    color: '#ffffff',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 30,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
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
