import AsyncStorage from '@react-native-async-storage/async-storage';

//get the current turbine instance
export const getCurrentTurbineInstance = async () => {
    try {
         const asyncInstance = await AsyncStorage.getItem('my-key');
         const asyncInstanceJson = asyncInstance ? JSON.parse(asyncInstance) : [];
 
         if (asyncInstanceJson.length > 0) {
            let currentInstance = asyncInstanceJson.find(i => i.isCurrentTurbine === true);
            return currentInstance || null;
        }

        return null; 
    } catch (error) {
        console.error('Failed to get current turbine instance:', error);
        return false;
    }
};

//get the current turbine instance
export const getAllTurbineInstance = async () => {
    try {
         const allInstance = await AsyncStorage.getItem('my-key');
         return asyncInstanceJson = allInstance ? JSON.parse(allInstance) : [];
    } catch (error) {
        console.error('Failed to get current turbine instance:', error);
        return false;
    }
};

//get the current turbine instance
export const makeAllTurbineInstanceFalse = async () => {
    try {
        const asyncInstance = await AsyncStorage.getItem('my-key');
        let asyncInstanceJson = asyncInstance ? JSON.parse(asyncInstance) : [];

        if(asyncInstanceJson.length == 0){
          return true; 
        }
        asyncInstanceJson = asyncInstanceJson.map(instance => ({
            ...instance,
            isCurrentTurbine: false
        }));

        await AsyncStorage.setItem('my-key', JSON.stringify(asyncInstanceJson));
        return true; 
    } catch (error) {
        console.error('Failed to update turbine instances:', error);
        return false; 
    }
};

//update the current turbine instance
export const setCurrentTurbineInstance = async (turbineInstance, isNew = false) => {
    try {

        const asyncInstance = await AsyncStorage.getItem('my-key');
        let asyncInstanceJson = asyncInstance ? JSON.parse(asyncInstance) : [];

        if (!isNew) {
        console.log("update")

            asyncInstanceJson = asyncInstanceJson.map(instance => 
                instance.isCurrentTurbine ? { ...instance, ...turbineInstance } : instance
            );
        } else {
            console.log("new")

            asyncInstanceJson = asyncInstanceJson.map(instance => ({
                ...instance,
                isCurrentTurbine: false
            }));

            turbineInstance.isCurrentTurbine = true;
            asyncInstanceJson.push(turbineInstance);
        }
        
        await AsyncStorage.setItem('my-key', JSON.stringify(asyncInstanceJson));
    } catch (error) {
        console.error('Failed to set current turbine instance:', error);
        return false;
    }
};

//check if the email exists
export const isEmailExist = async () => {
    try {
        const email = await AsyncStorage.getItem('email');
        console.log(email)
        return email && email.length > 0 ? true : false;
    } catch (error) {
        console.error('Failed to get email:', error);
        return false; 
    }
};

//get userData 
export const userData = async () => {
    try {
        const email = await AsyncStorage.getItem('email');
        return JSON.parse(email) || '';
    } catch (error) {
        console.error('Failed to get email:', error);
        return false; 
    }
};


export const getCurrentTurbineModule = async (id) => {
    try {
        const turbineInstance = await getCurrentTurbineInstance();
        return turbineInstance?.module?.length > 0 ? turbineInstance?.module.find(m => m == id) : null

    } catch (error) {
        console.error('Failed to get current turbine module:', error);
        return false;
    }
};

//update the current turbine instance
export const setCurrentTurbineProgressState = async (statusId) => {
    try {
        const turbineInstance = await getCurrentTurbineInstance();
        const updatedModules = turbineInstance.module.map(m => {
            if (m.id === turbineInstance.moduleId) {
                return { ...m, isProgressStatus: statusId };
            }
            return m;
        });
        
        const updatedTurbineInstance = {
            ...turbineInstance,
            module: updatedModules
        };

        await setCurrentTurbineInstance(updatedTurbineInstance);
    } catch (error) {
        console.error('Failed to set current turbine module:', error);
        return false;
    }
};

//remove login 
export const setLogOut = async (state) => {
    try{
        await AsyncStorage.setItem('logout', JSON.stringify(state));
        console.log(state,': Logout done');
        return 200;
    } catch (error) {
        console.error('Failed to logout:', error);
        return 401;
    }
}


//get userData 
export const getLogOut = async () => {
    try {
        const logout = await AsyncStorage.getItem('logout');
        console.log(JSON.parse(logout),': Logout value');
        return JSON.parse(logout) || '';
    } catch (error) {
        console.error('Failed to get logout:', error);
        return false; 
    }
};

//check if turbine id and Service order exists
export const isDetailsExist = async (turbineId, serviceOrder) => {
    try {
      const allInstances = await getAllTurbineInstance();
      if (allInstances.length === 0) {
        return false;
      }else{
        const isExist = allInstances?.some(
            instance => instance?.turbineId === turbineId && instance?.serviceOrder === serviceOrder
          );
          return isExist;

      }
      
    } catch (error) {
      console.error('Failed to check if turbine and service order exisr:', error);
      return false;
    }
   };

//set current language and system
export const setCurrent = async(lang, system) => {
    const data = {
        lang: lang,
        system: system
    }
    try{
        await AsyncStorage.setItem('currentSystem', JSON.stringify(data));
        console.log('async set');
        return 200;
     }catch(err){
        console.error('Failed to store current preference', err);
     }
}

//get c
export const getCurrent = async () => {  
    try {    
      const value = await AsyncStorage.getItem('currentSystem');    
            if (value !== null) {
                let _val = JSON.parse(value)
                console.log('value', _val?.lang, _val?.system?.id);
                return {lang: _val?.lang, id:_val?.system?.id};
            }  
        } catch (error) { 
        console.log('error', error);
}};

//get current task
export const getCurrentTask = async (task) => {
    try {
        const instance = await getCurrentTurbineInstance();
        console.log(task)
        console.log("task")
        const curTask = instance?.tasks?.find(
            t => t?.taskId === task.taskId && t?.subTaskId === task.subTaskId
        );
        console.log(curTask)
        return curTask;

    } catch (error) {
        console.error('Failed to check if turbine and service order exisr:', error);
        return false;
    }
};

//update selected task
export const updateCurrentTask = async (task) => {
    try {

        const instance = await getCurrentTurbineInstance();
        instance.tasks = instance?.tasks?.map(t => {
            if (t?.taskId === task.taskId && t?.subTaskId === task.subTaskId) {
                return {
                    ...t,
                    measuredThickness: task.measuredThickness
                }
            }
            return t
        });
        console.log("TASK UPDATE IN INSTANCE ")
        await setCurrentTurbineInstance(instance)

    } catch (error) {
        console.error('Failed to check if turbine and service order exisr:', error);
        return false;
    }
};