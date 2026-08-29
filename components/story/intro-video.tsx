import { useEvent, useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type IntroVideoProps = {
  onComplete: () => void;
};

export function IntroVideo({ onComplete }: IntroVideoProps) {
  const finishedRef = useRef(false);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayOpacity = useSharedValue(1);

  const finish = useCallback(() => {
    if (finishedRef.current) {
      return;
    }

    finishedRef.current = true;
    overlayOpacity.value = withTiming(1, {
      duration: 1200,
      easing: Easing.inOut(Easing.cubic),
    });

    completionTimerRef.current = setTimeout(() => {
      onComplete();
    }, 1200);
  }, [onComplete]);

  const player = useVideoPlayer(require('../../assets/video/Globe drone zoom.mp4'), (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.muted = true;
    videoPlayer.play();
  });

  const status = useEvent(player, 'statusChange', {
    status: player.status,
  });

  useEventListener(player, 'playToEnd', () => {
    finish();
  });

  useEffect(() => {
    overlayOpacity.value = withTiming(0, {
      duration: 1400,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [overlayOpacity]);

  useEffect(() => {
    if (status.error) {
      finish();
    }
  }, [finish, status.error]);

  useEffect(() => () => {
    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <VideoView
        allowsPictureInPicture={false}
        contentFit="cover"
        fullscreenOptions={{ enable: false }}
        nativeControls={false}
        player={player}
        style={styles.video}
        surfaceType="textureView"
      />
      <Animated.View pointerEvents="none" style={[styles.overlay, overlayStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
});
