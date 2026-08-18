import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const useMediaQuery = (): { isXs: boolean; isSm: boolean; isMd: boolean; isLg: boolean; isXl: boolean; breakpoint: Breakpoint } => {
  const [width, setWidth] = useState(() => Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const isXs = width < 576;
  const isSm = width >= 576 && width < 768;
  const isMd = width >= 768 && width < 992;
  const isLg = width >= 992 && width < 1200;
  const isXl = width >= 1200;

  const breakpoint: Breakpoint = isXs ? 'xs' : isSm ? 'sm' : isMd ? 'md' : isLg ? 'lg' : 'xl';

  return { isXs, isSm, isMd, isLg, isXl, breakpoint };
};

export const isWeb = Platform.OS === 'web';
export const isNative = Platform.OS !== 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
