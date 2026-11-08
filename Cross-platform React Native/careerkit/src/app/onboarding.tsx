import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogo } from '@/components/AppLogo';
import { Button } from '@/components/Button';
import { toneBackground } from '@/components/Tile';
import { ONBOARDING_SLIDES, type OnboardingSlide } from '@/constants/onboarding';
import { Colors, FontSize, FontWeight, MIN_TOUCH_SIZE, Radius, Spacing } from '@/constants/theme';
import { useCompleteOnboarding } from '@/hooks/useOnboarding';

const ART_SIZE = 200;
const DOT_SIZE = 8;

/**
 * Intro slides (first launch, or "View intro again" in Settings).
 * A horizontal FlatList with paging = one full-width slide per swipe.
 * Opened from Settings with ?replay=1, finishing just goes back instead of opening Home.
 */
export default function OnboardingScreen() {
  const { replay } = useLocalSearchParams<{ replay?: string }>();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [index, setIndex] = useState(0);
  const completeOnboarding = useCompleteOnboarding();

  const isLast = index === ONBOARDING_SLIDES.length - 1;

  const finish = async () => {
    try {
      await completeOnboarding();
    } catch (e) {
      console.warn('[onboarding] save failed', e);
    }
    if (replay && router.canGoBack()) router.back();
    else router.replace('/');
  };

  const goNext = () => {
    if (isLast) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    setIndex(index + 1);
  };

  /** After a swipe stops, work out which slide is showing. */
  const onSwipeEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.step}>{`${index + 1} / ${ONBOARDING_SLIDES.length}`}</Text>
        {!isLast ? (
          <Pressable onPress={finish} accessibilityRole="button" style={styles.skip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onSwipeEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => <Slide slide={item} width={width} />}
      />

      <View style={styles.bottom}>
        <View style={styles.dots} accessibilityLabel={`Slide ${index + 1} of ${ONBOARDING_SLIDES.length}`}>
          {ONBOARDING_SLIDES.map((s, i) => (
            <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Button title={isLast ? 'Get started' : 'Next'} icon={isLast ? 'checkmark' : 'arrow-forward'} onPress={goNext} />
      </View>
    </SafeAreaView>
  );
}

function Slide({ slide, width }: { slide: OnboardingSlide; width: number }) {
  return (
    <View style={[styles.slide, { width }]}>
      {/* Placeholder illustration: a big tonal circle with the feature's icon. */}
      <View style={[styles.art, { backgroundColor: toneBackground(slide.tone) }]}>
        {slide.icon === 'logo' ? (
          <AppLogo size={ART_SIZE * 0.78} />
        ) : (
          <Ionicons name={slide.icon} size={ART_SIZE * 0.4} color={Colors.onPrimaryContainer} />
        )}
      </View>

      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.body}>{slide.body}</Text>

      <View style={styles.points}>
        {slide.points.map((p) => (
          <View key={p} style={styles.point}>
            <Ionicons name="checkmark-circle" size={FontSize.lg} color={Colors.accent} />
            <Text style={styles.pointText}>{p}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    minHeight: MIN_TOUCH_SIZE,
  },
  step: {
    fontSize: FontSize.sm,
    color: Colors.mutedText,
  },
  skip: {
    minHeight: MIN_TOUCH_SIZE,
    minWidth: MIN_TOUCH_SIZE,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  art: {
    width: ART_SIZE,
    height: ART_SIZE,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  body: {
    fontSize: FontSize.md,
    color: Colors.mutedText,
    textAlign: 'center',
  },
  points: {
    alignSelf: 'stretch',
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pointText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  bottom: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: Radius.pill,
    backgroundColor: Colors.outline,
  },
  dotActive: {
    width: DOT_SIZE * 3, // the current slide's dot stretches into a short pill
    backgroundColor: Colors.primary,
  },
});
