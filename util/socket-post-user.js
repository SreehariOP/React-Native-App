// import { useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import io from 'socket.io-client';

// const SocketPostUser = () => {
//     const headers = {
//         'X-access-Token': 'Yn8uMnYevYiDhsmwaIhcg==' 
//     };
//     useEffect(() => {
//         const socket = io('http://localhost:3000',{
//              extraHeaders: headers
//         }); 

//         const fetchDataAndEmit = async () => {
//             try {
//                 const myKey = 'my-key';
//                 const value = await AsyncStorage.getItem(myKey);
//                 console.log('Value from AsyncStorage:', value);
                
//                 socket.emit('dataFromClient', { data: value });

//             } catch (error) {
//                 console.error('Error retrieving data from AsyncStorage:', error);
//             }
//         };

//         const intervalId = setInterval(fetchDataAndEmit, 20000); 

//         // Clean up function
//         return () => {
//             clearInterval(intervalId); 
//             socket.disconnect(); 
//             console.log('Socket.IO and interval cleared');
//         };

//     }, []);

//     return null; 
// };

// export default SocketPostUser;
