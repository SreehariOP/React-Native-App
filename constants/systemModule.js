export const systemStatus = {
  NOT_DOWNLOADED: 0,
  DOWNLOADED: 1,
  NOT_STARTED: 2,
  IN_PROGRESS: 3,
  COMPLETED: 4
};

export let systemData = [
    { id : 0 ,label: 'Yaw System' , fileSize : 195 , progressPercentage : 0 , isDownload : false, isNotDisable : true, downloadProgressPercentage :  0, isProgressStatus :systemStatus.NOT_DOWNLOADED},
    { id : 1 , label: 'Rotor', fileSize : 202 , progressPercentage : 0 , isDownload : false, isNotDisable : false, downloadProgressPercentage :  0, isProgressStatus :systemStatus.NOT_DOWNLOADED},
  ];

