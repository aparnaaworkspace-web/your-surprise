import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Image, type ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { STORY_FONT_FAMILY } from '@/constants/typography';
import { useAudioPlayer } from 'expo-audio';
const { width: screenWidth } = Dimensions.get('window');

export function MusicCard({
  imageSource,
  audioSource,
  title,
  description,
  isPlaying,
  onTogglePlay,
}: {
  imageSource: ImageSourcePropType;
  audioSource: any;
  title: string;
  description: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
}) {
  const spin = useSharedValue(0);
  const player = useAudioPlayer(audioSource);

  const handlePlay = () => {
    onTogglePlay();
  };

  useEffect(() => {
    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      spin.value = withRepeat(
        withTiming(spin.value + 360, {
          duration: 4200,
          easing: Easing.linear,
        }),
        -1,
        false
      );
      return;
    }

    cancelAnimation(spin);
  }, [isPlaying, spin]);
  
const discStyle = useAnimatedStyle(() => ({
  transform: [{ rotate: `${spin.value}deg` }],
}));

const offset = useSharedValue(screenWidth);

useEffect(() => {
  offset.value = withRepeat(
    withTiming(-100, {
      duration: 7000,
      easing: Easing.linear,
    }),
    -1,
    false
  );
}, []);

const animatedDescriptionStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: offset.value }],
}));
  return (
    <View style={styles.card}>
      <View style={styles.thumbWrap}>
        <Animated.View style={[styles.recordWrap, discStyle]}>
          <View style={styles.disc}>
            <View style={styles.discGrooveOuter} />
            <View style={styles.discGrooveInner} />
            <View style={styles.discInner} />
          </View>
          <Image source={imageSource} style={styles.thumbnail} />
        </Animated.View>
      </View>

      <View style={styles.copy}>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        <Text numberOfLines={3} style={styles.description}>
          {description}
        </Text>
      </View>

      <Pressable onPress={handlePlay}style={styles.playButton}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#d9ecff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(11, 39, 66, 0.9)',
    borderColor: 'rgba(142, 173, 204, 0.14)',
    borderRadius: 32,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 120,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: '#0f5ec0',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    shadowColor: '#3f8fff',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    marginLeft: 4,
    width: 48,
  },
  thumbWrap: {
    alignItems: 'center',
    height: 82,
    justifyContent: 'center',
    width: 82,
  },
  recordWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    alignItems: 'center',
    backgroundColor: '#121a22',
    borderColor: '#404856',
    borderRadius: 41,
    borderWidth: 1,
    height: 82,
    justifyContent: 'center',
    width: 82,
  },
  discGrooveOuter: {
    borderColor: 'rgba(171, 191, 213, 0.18)',
    borderRadius: 31,
    borderWidth: 1,
    height: 62,
    position: 'absolute',
    width: 62,
  },
  discGrooveInner: {
    borderColor: 'rgba(171, 191, 213, 0.12)',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    position: 'absolute',
    width: 44,
  },
  discInner: {
    backgroundColor: '#334051',
    borderRadius: 11,
    borderWidth: 3,
    borderColor: '#8ba5c2',
    height: 22,
    width: 22,
  },
  thumbnail: {
    borderColor: 'rgba(229, 238, 250, 0.85)',
    borderRadius: 24,
    borderWidth: 2,
    height: 48,
    position: 'absolute',
    width: 48,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 6,
  },
  title: {
    color: '#d9e4f3',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 18,
    lineHeight: 24,
  },
  description: {
    color: '#6d8aa7',
    fontFamily: STORY_FONT_FAMILY,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
});
