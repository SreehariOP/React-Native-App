import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dataSet } from "../assets/config/sourceConfig";
 
const LanguageContext = createContext();
 
const LanguageProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [labels, setLabels] = useState(dataSet[0].en.label);
  const [systemContent, setSystemContent] = useState(dataSet[0].en.content);
  const [abbreviation, setAbbreviation] = useState(dataSet[0].en.abbrevation);
  const [currentSystem, setCurrentSystem] = useState(null);
 
  useEffect(() => {
    const loadStoredLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('selectedLanguage');
        if (storedLanguage) {
          setLanguage(storedLanguage);
        }
      } catch (error) {
        console.error("Failed to load language", error);
      }
    };
    loadStoredLanguage();
  }, []);
 
  const setLanguage = (language) => {
    setSelectedLanguage(language);
    AsyncStorage.setItem('selectedLanguage', language);
 
    switch (language) {
      case 'es':
        setLabels(dataSet[0].es.label);
        setSystemContent(dataSet[0].es.content);
        setAbbreviation(dataSet[0].es.abbrevation);
        break;
      case 'pt':
        setLabels(dataSet[0].pt.label);
        setSystemContent(dataSet[0].pt.content);
        setAbbreviation(dataSet[0].pt.abbrevation);
        break;
      default:
        setLabels(dataSet[0].en.label);
        setSystemContent(dataSet[0].en.content);
        setAbbreviation(dataSet[0].en.abbrevation);
    }
  };
 
  return (
<LanguageContext.Provider value={{ selectedLanguage, setLanguage, labels, systemContent, abbreviation, setSystemContent, setAbbreviation, currentSystem, setCurrentSystem }}>
      {children}
</LanguageContext.Provider>
  );
};
 
export { LanguageContext, LanguageProvider };