import { systemData, systemStatus } from "../constants/systemModule";
import { getCurrentTurbineInstance, setCurrentTurbineInstance, setCurrentTurbineProgressState } from "./asyncUtils";

export const getTimeStamp = async (id) => {
    try {

        const turbineInstance = await getCurrentTurbineInstance();
        let timeStampState = ''
        if (turbineInstance) {
            if (turbineInstance?.tasks?.length) {

                const isTaskFounds = turbineInstance?.tasks.filter(task => task.taskId === id);
                if (isTaskFounds.length == 0) {
                    timeStampState = null;
                } else {
                    timeStampState = isTaskFounds.every(task => task.isResume === false) ? "success" : "progress";
                    ;
                }
            }
        }

        return timeStampState;
    } catch (error) {
        return false;
    }
};

export const getProgressTask = async (id, turbineInstance) => {
 
    let taskList = []; 
    try {
        let taskIds;


        if (turbineInstance) {
            if (turbineInstance?.moduleId == 0) {
                taskIds = {
                    '5.1': ['5.1.1', '5.1.2', '5.1.3', '5.1.5', '5.1.6', '5.1.8'],
                    '5.2': ['5.2.1', '5.2.2', '5.2.3'],
                    '5.3': ['5.3.0','5.3.1', '5.3.2', '5.3.4'],
                    '5.4': ['5.4.1', '5.4.2']
                };
            } else if (turbineInstance?.moduleId == 1) {
                taskIds = {
                    '5.2': ["5.2.6.13", "5.2.6.14"]
                };
            }


            taskList = taskIds?.[id] || [];
            if (turbineInstance?.tasks?.length) {
                const filteredTasks = turbineInstance.tasks.filter(task =>
                    taskList.includes(task.taskId)
                );
                let completed = 0;
                let inProgress = 0;
                let notStarted = 0;

                const taskGroups = filteredTasks.reduce((acc, task) => {
                    if (!acc[task.taskId]) {
                        acc[task.taskId] = [];
                    }
                    acc[task.taskId].push(task);
                    return acc;
                }, {});

                for (const taskId of taskList) {
                    const group = taskGroups[taskId];

                    if (group) {
                        const hasResume = group.some(task => task.isResume);
                        if (hasResume) {
                            inProgress++;
                        } else {
                            completed++;
                        }
                    } else {
                        notStarted++;
                    }
                }

                notStarted = taskList.length - filteredTasks.length;

                const result = {
                    total: taskList.length,
                    completed,
                    inprogress: inProgress,
                    not_started: notStarted
                };

                console.log(result);

                return result;
            }
        }

        return {
            total: taskList.length,
            completed: 0,
            inprogress: 0,
            not_started: taskList.length
        };
    } catch (error) {
        console.error("Error fetching progress task:", error);
        return {
            total: taskList.length,  // Use taskList, which is initialized at the beginning
            completed: 0,
            inprogress: 0,
            not_started: taskList.length
        };
    }
};



export const getProgressPercentage = async (id) => {
    try {
        let taskIds = {}
        if (id == 0) {

            taskIds = {
                '5.1': ['5.1.1', '5.1.2', '5.1.3', '5.1.5', '5.1.6', '5.1.8'],
                '5.2': ['5.2.1', '5.2.2', '5.2.3'],
                '5.3': ['5.3.0','5.3.1', '5.3.2', '5.3.4'],
                '5.4': ['5.4.1', '5.4.2']
            };
        } else if (id == 1) {
            taskIds = {
                '5.2': ["5.2.6.13", "5.2.6.14"],

            };
        }

        const turbineInstance = await getCurrentTurbineInstance();

        if (turbineInstance) {
            let groupStatus = {};

            for (let groupId in taskIds) {
                const tasksInGroup = taskIds[groupId];
                if (turbineInstance?.tasks?.some(task => tasksInGroup.includes(task.taskId))) {

                        const isInProgress = tasksInGroup.some(taskId => {
                            const task = turbineInstance?.tasks?.find(task => task.taskId === taskId);
                            return task && task.isResume;
                        });

                        const areAllTasksCompleted = tasksInGroup.every(taskId => {
                            if( turbineInstance?.tasks?.filter(task => task.taskId === taskId).length == 0 ){
                                return false
                            }
                            return turbineInstance?.tasks?.filter(task => task.taskId === taskId).every(a => a.isResume == false);
                        });
                        if(areAllTasksCompleted){
                            groupStatus[groupId] = 'completed' 
                        }
                    
                }
            }

            var total = Object.keys(taskIds).length;
      
            var diffPercentage = 100 / total || 0;
 
            var completedPercentage = Object.keys(groupStatus).length * diffPercentage;
            completedPercentage == 0? await setCurrentTurbineProgressState(systemStatus.NOT_STARTED) : null;
            completedPercentage > 0? await setCurrentTurbineProgressState(systemStatus.IN_PROGRESS) : null;
            completedPercentage == 100? await setCurrentTurbineProgressState(systemStatus.COMPLETED) : null

            return completedPercentage

        }

        return 0 

    } catch (error) {
        console.error("Error fetching progress percentage:", error);
        return 0
    }
};

export const getTurbineProgressPercentage = async (turbineInstance) => {
    try {
        let totalPrecentage = systemData.length;
        let overallPercentage = 0;

        if (turbineInstance) {

            if(turbineInstance?.module && turbineInstance?.module.length > 0){

                const cumlatePercentage =  turbineInstance?.module.reduce((acc ,item) => {
                    
                    return acc += item?.progressPercentage;
                  }, 0)
                  
                  const result = (cumlatePercentage / totalPrecentage) ;
                  overallPercentage  = Math.round(result);
                   return  overallPercentage
            }

        }

         return 0;
 

    } catch (error) {
        console.error("Error fetching getTurbineProgressPercentage:", error);
        return 0
    }
};


export const getTimeStampDone = async (ids,turbineInstance) => {
    try {
        let taskIds;
        if (turbineInstance) {
            if(turbineInstance?.moduleId == 0){
                taskIds = {
                    '5.1': ['5.1.1', '5.1.2', '5.1.3', '5.1.5', '5.1.6', '5.1.8'],
                    '5.2': ['5.2.1', '5.2.2', '5.2.3'],
                    '5.3': ['5.3.0', '5.3.1', '5.3.2', '5.3.4'],
                    '5.4': ['5.4.1', '5.4.2']
                };
            }else if (turbineInstance?.moduleId == 1) {
                taskIds = {
                    '5.2': ["5.2.6.13", "5.2.6.14"]
                };
            }
    
            let finalArr = [];
            ids?.forEach(id => {
                if (taskIds[id]) {
                    finalArr = finalArr.concat(taskIds[id]);
                }
            });
            let groupStatus = {};

            for (let groupId in taskIds) {
                const tasksInGroup = taskIds[groupId];

                if (ids.includes(groupId) && turbineInstance?.tasks?.some(task => tasksInGroup.includes(task.taskId))) {
                    if (groupId === '5.4') {
                        const areAllSubTasksCompleted = tasksInGroup.every(taskId => {
                            const task = turbineInstance?.tasks?.find(task => task.taskId === taskId);
                            return task && !task.isResume;
                        });

                        groupStatus[groupId] = areAllSubTasksCompleted ? 'completed' : 'inProgress';
                    } else {
                        const isInProgress = tasksInGroup.some(taskId => {
                            const task = turbineInstance?.tasks?.find(task => task.taskId === taskId);
                            return task && task.isResume;
                        });

                        const areAllTasksCompleted = tasksInGroup.every(taskId => {
                            if( turbineInstance?.tasks?.filter(task => task.taskId === taskId).length == 0 ){
                                return false
                            }
                            return turbineInstance?.tasks?.filter(task => task.taskId === taskId).every(a => a.isResume == false);
                        });
                        groupStatus[groupId] = areAllTasksCompleted ? 'completed' : 'inProgress';
                    }
                }
            }

            return groupStatus;
        } else {
            return {};
        }

    } catch (error) {
        console.error('Error retrieving tasks from AsyncStorage:', error);
        return false;
    }
};
