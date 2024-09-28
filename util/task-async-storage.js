import { getCurrentTurbineInstance, setCurrentTurbineInstance } from "./asyncUtils";

const updateTaskAsyncStorage = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);

    const turbineInstance = await getCurrentTurbineInstance();

    if (turbineInstance) {

      if (turbineInstance && turbineInstance?.tasks && turbineInstance?.tasks.length > 0) {

     const calculateTimeDifference = (startTime, endTime, existingDiffTime = "0:0:0") => {
      if (existingDiffTime === "NaN:NaN:NaN") {
        existingDiffTime = "00:00:00";
      }
        const diff = endTime - startTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const [existingHours = 0, existingMinutes = 0, existingSeconds = 0] = existingDiffTime.split(':').map(Number);

        const totalHours = hours + existingHours;
        const totalMinutes = minutes + existingMinutes;
        const totalSeconds = seconds + existingSeconds;


        const carryMinutes = Math.floor(totalSeconds / 60);
        const carryHours = Math.floor((totalMinutes + carryMinutes) / 60);

        const finalHours = totalHours + carryHours;
        const finalMinutes = (totalMinutes + carryMinutes) % 60;
        const finalSeconds = totalSeconds % 60;

        return `${finalHours}:${finalMinutes}:${finalSeconds}`;
      };

        let nullPreviousTaskId = [ "5.1.5","5.1.8","5.2.1",   "5.2.2",   "5.3.1", "5.3.2", "5.3.4", "5.4.2" ,"5.2.6.13",   "5.2.6.14", ]
        if(value.previousSubTaskId == null && (nullPreviousTaskId.includes(value.previousTaskId)) && value.isResume == false){
          console.log("am Here null previousSubTaskId",value)
          console.log("turbineInstance 13",turbineInstance)

          const existTaskIndex = turbineInstance?.tasks.findIndex((task) => task.taskId === value.previousTaskId );
          if(existTaskIndex != -1){
            const selectedTask = turbineInstance.tasks[existTaskIndex];
          
            selectedTask.endTime = value.endTime;
            selectedTask.diffTime = calculateTimeDifference(selectedTask.startTime, value.endTime, selectedTask.diffTime);
            selectedTask.isResume = value?.isResume || false;
            selectedTask.subTaskId = value?.previousSubTaskId || null;
            selectedTask.moduleId = turbineInstance.moduleId
            turbineInstance.tasks[existTaskIndex] = selectedTask;
            console.log("if am Here null previousSubTaskId",turbineInstance.tasks[existTaskIndex])
          console.log("turbineInstance 14",turbineInstance)

          }else{
            let newTask = {
              isResume: value?.isResume || true,
              taskId: value.previousTaskId,
              subTaskId: value?.previousSubTaskId ,
              startTime: value?.startTime,
              endTime : value?.endTime,
              diffTime : calculateTimeDifference(value?.startTime, value?.endTime),
              moduleId :turbineInstance.moduleId,
            };
            console.log("else am Here null previousSubTaskId",newTask)

            turbineInstance.tasks.push(newTask); 
          console.log("turbineInstance 15",turbineInstance)

          }

          
        }

        if (value.previousSubTaskId != null && value.previousSubTaskId >= 0) {
          console.log("am Here previousSubTaskId",value)
          console.log("turbineInstance 4",turbineInstance)

          const existTaskIndex = turbineInstance?.tasks.findIndex((task) => task.taskId === value.previousTaskId && task.subTaskId === value.previousSubTaskId );
          if(existTaskIndex != -1){
            
            const selectedTask = turbineInstance.tasks[existTaskIndex];
            selectedTask.endTime = value.endTime;
            selectedTask.diffTime = calculateTimeDifference(selectedTask.startTime, value.endTime, selectedTask.diffTime);
            selectedTask.isResume = value?.isResume || false;
            selectedTask.moduleId = turbineInstance.moduleId
            turbineInstance.tasks[existTaskIndex] = selectedTask;
            console.log("if am Here previousSubTaskId",turbineInstance.tasks[existTaskIndex])
            console.log("turbineInstance 5",turbineInstance)

          }else{
            console.log("turbineInstance 6",turbineInstance)

            //TEMP FIX
            let newTask = {
              isResume: value?.isResume || true,
              taskId: value.previousTaskId,
              subTaskId: value.previousSubTaskId ,
              startTime: value.startTime,
              endTime : value.endTime,
              diffTime : calculateTimeDifference(value.startTime, value.endTime),
              moduleId :turbineInstance.moduleId,
            };
            console.log("else am Here previousSubTaskId",newTask)

            turbineInstance.tasks.push(newTask);
            console.log("turbineInstance 7",turbineInstance)

          }
          console.log("turbineInstance 8",turbineInstance)

        }

        if (value.currentSubTaskId == null) {
          console.log("am Here currentSubTaskId",value.currentTaskId)
          console.log("turbineInstance 9",turbineInstance)

          const existTaskIndex = turbineInstance?.tasks?.findIndex((task) => task.taskId === value.currentTaskId && task.subTaskId === value.currentSubTaskId );
          if(existTaskIndex == -1){
            let newTask = {
              isResume:value?.isResume || true,
              taskId: value.currentTaskId,
              subTaskId: value.currentSubTaskId,
              startTime: value.startTime,
              moduleId : turbineInstance.moduleId,
            };
            console.log("if am Here currentSubTaskId",newTask)

            turbineInstance?.tasks.push(newTask);
            console.log("turbineInstance 10",turbineInstance)

          }else{

          const selectedTask = turbineInstance.tasks[existTaskIndex];
          selectedTask.endTime = value.endTime;
          selectedTask.diffTime = calculateTimeDifference(selectedTask.startTime, value.endTime, selectedTask.diffTime);
          selectedTask.moduleId = turbineInstance.moduleId
          turbineInstance.tasks[existTaskIndex] = selectedTask;
          console.log("else am found Here null currentSubTaskId",selectedTask)
          console.log("turbineInstance 11",turbineInstance)


          }
          console.log("turbineInstance 12",turbineInstance)
         
        }

        if (value.currentSubTaskId != null && value.currentSubTaskId >=0) {
          console.log("am Here currentSubTaskId",value.currentTaskId)
          console.log("turbineInstance 1",turbineInstance)

          const existTaskIndex = turbineInstance?.tasks?.findIndex((task) => task.taskId === value.currentTaskId && task.subTaskId === value.currentSubTaskId );
          if(existTaskIndex == -1){
          console.log("turbineInstance 2",turbineInstance)

            let newTask = {
              isResume:value?.isResume || true,
              taskId: value.currentTaskId,
              subTaskId: value.currentSubTaskId,
              startTime: value.startTime,
              moduleId : turbineInstance.moduleId,
            };
            console.log("if am found Here currentSubTaskId",newTask)

            turbineInstance?.tasks.push(newTask);
            console.log("turbineInstance 3",turbineInstance)

          }else{

          const selectedTask = turbineInstance.tasks[existTaskIndex];
          selectedTask.endTime = value.endTime;
          selectedTask.diffTime = calculateTimeDifference(selectedTask.startTime, value.endTime, selectedTask.diffTime);
          selectedTask.moduleId = turbineInstance.moduleId
          turbineInstance.tasks[existTaskIndex] = selectedTask;
          console.log("else am found Here currentSubTaskId",selectedTask)

          }
         
        }

        
        
      } else {
        turbineInstance.tasks = [];
        let newTask = {
          isResume: value?.isResume ||true,
          taskId: value.currentTaskId,
          subTaskId: value.currentSubTaskId ,
          startTime: value.startTime,
          moduleId :turbineInstance.moduleId,
        };
        console.log("else ",newTask)

        turbineInstance.tasks.push(newTask);
      }
    console.log(turbineInstance)
    await setCurrentTurbineInstance(turbineInstance);
  } else {
    console.log(jsonValue)

      await setCurrentTurbineInstance(jsonValue);
    }

    console.log(`AsyncStorage updated for key '${key}' with value:`, value);
    return true;
  } catch (error) {
    console.error(`Error updating AsyncStorage for key '${key}':`, error);
    return false;
  }
};

export default updateTaskAsyncStorage;
