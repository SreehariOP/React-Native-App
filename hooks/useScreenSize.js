import { useWindowDimensions } from 'react-native';

const useScreenSize = () => {
  const { width, height } = useWindowDimensions();

  const screenSizeCategory = (() => {
    if (width < 576) {
      return 'small';
    } else if  (width <= 855 || height <= 490)  {
      return 'large';
    }
  })();

  return { width, height, screenSizeCategory };
};

export default useScreenSize;