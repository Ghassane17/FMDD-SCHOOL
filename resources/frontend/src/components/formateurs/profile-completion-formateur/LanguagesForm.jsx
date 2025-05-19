import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

const LanguagesForm = ({ data, updateData }) => {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  
  const languages = [
    { name: "Arabe", code: "AR" },
    { name: "Français", code: "FR" },
    { name: "Anglais", code: "EN" },
    { name: "Espagnol", code: "ES" },
    { name: "Allemand", code: "DE" },
    { name: "Italien", code: "IT" }
  ];
  
  const availableLanguages = languages.filter(
    lang => !data.some(userLang => userLang.name === lang.name)
  );
  
  const handleAddLanguage = () => {
    if (!selectedLanguage) return;
    
    const languageToAdd = languages.find(lang => lang.name === selectedLanguage);
    if (languageToAdd && !data.some(lang => lang.name === languageToAdd.name)) {
      updateData([...data, languageToAdd]);
      setSelectedLanguage("");
    }
  };
  
  const handleRemoveLanguage = (languageName) => {
    updateData(data.filter(lang => lang.name !== languageName));
  };

  // Colors for different language flags/backgrounds
  const getLanguageColor = (code) => {
    const colors = {
      AR: "from-green-700 to-green-800",
      FR: "from-blue-500 to-blue-600",
      EN: "from-red-500 to-red-600",
      ES: "from-yellow-400 to-yellow-500",
      DE: "from-yellow-500 to-yellow-600",
      IT: "from-green-500 to-green-600"
    };
    
    return colors[code] || "from-gray-500 to-gray-600";
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Quelles langues parlez-vous ?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Ajoutez les langues que vous parlez pour pouvoir enseigner à un public international.
        </p>
        
        <div className="flex gap-2 mb-6">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="flex items-center justify-between w-full h-14 px-5 py-3 text-lg border border-gray-300 rounded-xl bg-white shadow focus:outline-none focus:ring-2 focus:ring-primary transition-all">
              <span className="text-gray-800 font-medium flex-grow text-left pr-6">
                {selectedLanguage || <span className="text-gray-400">Sélectionnez une langue</span>}
              </span>
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-gray-200 rounded-lg shadow-lg">
              {availableLanguages.map((language) => (
                <SelectItem 
                  key={language.code} 
                  value={language.name} 
                  className="text-lg py-3 px-4 cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:text-primary data-[state=checked]:bg-gray-100 data-[state=checked]:text-primary"
                >
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            type="button" 
            onClick={handleAddLanguage} 
            disabled={!selectedLanguage} 
            className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-lg text-white transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed px-8 h-14"
          >
            Ajouter
          </Button>
        </div>
        
        {data.length > 0 && (
          <div className="mb-6">
            <Label className="mb-2 block text-sm font-medium">Vos langues</Label>
            <div className="flex flex-wrap gap-2">
              {data.map((language, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-r ${getLanguageColor(language.code)} text-white py-2 px-3 rounded-full flex items-center gap-2 text-sm transition-all duration-200 hover:scale-105`}
                >
                  <span className="font-medium">{language.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(language.name)}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguagesForm;
