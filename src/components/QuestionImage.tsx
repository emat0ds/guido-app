import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { getSignImage } from '@/lib/imageMap';

interface QuestionImageProps {
  imagePath?: string | null;
  height?: number;
}

export function QuestionImage({ imagePath, height = 160 }: QuestionImageProps) {
  const source = getSignImage(imagePath);
  if (!source) return null;

  return (
    <View style={[styles.container, { height }]}>
      <Image
        source={source}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141417',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
