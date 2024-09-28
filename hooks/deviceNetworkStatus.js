import NetInfo from '@react-native-community/netinfo';
import React, { useState, useEffect } from 'react';

const useInternetStatus = () => {
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        NetInfo.fetch().then((state) => {
            setIsOnline(state.isConnected);
          });
      
          const unsubscribe = NetInfo.addEventListener((state) => {
            setIsOnline(state.isConnected);
          });
      
          return () => {
            unsubscribe()
          }
    }, [isOnline]);

    return isOnline;
};

export default useInternetStatus;
