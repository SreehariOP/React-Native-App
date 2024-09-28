import RNFS from 'react-native-fs';

const getFolderSize = async (folderName) => {
  try {
    console.log(folderName)
    // Read directory contents from assets
    const reader = await RNFS.readDirAssets(folderName);
    console.log(reader)
    // Separate directories and files
    const directories = reader.filter((item) => item.isDirectory());
    const files = reader.filter((item) => item.isFile()).map((file) => file.path);

    // Recursively get files from directories
    const directoriesFilesPromises = directories.map((dir) => (
      getAllFilePathsFromFolder(dir.name) // Use dir.name for folder names
    ));

    // Wait for all directories' files and flatten the result
    const directoriesFiles = await (await Promise.all(directoriesFilesPromises)).flat(Infinity);

    // Return combined list of files
    return [...files, ...directoriesFiles];
  } catch (error) {
    console.error('Error getting file paths from folder:', error);
    return [];
  }
  // try {
  //   const files = await RNFS.readDir(folderPath);
  //   let totalSize = 0;

  //   const calculateSize = async (filePath) => {
  //     try {
  //       const stats = await RNFS.stat(filePath);
  //       if (stats.isFile()) {
  //         totalSize += stats.size;
  //       } else if (stats.isDirectory()) {
  //         const subFiles = await RNFS.readDir(filePath);
  //         for (const subFile of subFiles) {
  //           await calculateSize(subFile.path);
  //         }
  //       }
  //     } catch (error) {
  //       console.error(`Error getting stats for ${filePath}:`, error);
  //     }
  //   };

  //   for (const file of files) {
  //     await calculateSize(file.path);
  //   }

  //   return totalSize;
  // } catch (error) {
  //   console.error('Error reading directory:', error);
  //   return null;
  // }
};

export default getFolderSize;
