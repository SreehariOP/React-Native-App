import  environment  from "../enviroments/enviroment";

import axios from 'axios';

export const isServiceExistAPI = async (serviceOrder, turbineId) => {
    const headers= {
            'X-access-Token': 'Yn8uMnYevYiDhsmwaIhcg==',
        }

    url = `${environment.test_api}/vtp/isServiceExist/${serviceOrder}/${turbineId}`
    console.log(url)
    try {
        const response = await axios.get(url, {
            headers: headers,
          });
        return response?.data
    } catch (error) {
        console.error("Error fetching the service api", error);
    }
};