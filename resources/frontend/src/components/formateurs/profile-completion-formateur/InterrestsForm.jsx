import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

const interrestsForm = ({ data, updateData }) => {
const [newSkill, setNewSkill] = useState("");
  
const handleAddSkill = () => {
    if (newSkill.trim() && !data.includes(newSkill.trim())) {
      updateData([...data, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    updateData(data.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Badge variants for skills
  const getBadgeVariant = (index) => {
    const variants = ["secondary", "danger", "success", "info", "warning", "purple"];
    return variants[index % variants.length];
  };

  const suggestedSkills = [
  "Informatique",              // Computer Science
  "Développement",         // Web Development
  "Programmation",             // Programming (JS, Python, etc.)
  "Science des données",       // Data Science
  "Intelligence Artificielle", // AI & Machine Learning
  "Cybersécurité",             // Cybersecurity
  "Mathématiques",             // Mathematics
  "Physique",                  // Physics
  "Chimie",                    // Chemistry
  "Biologie",                  // Biology
  "Design Graphique",          // Graphic Design
  "Marketing Digital",         // Digital Marketing
  "Entrepreneuriat",           // Entrepreneurship
  "Finance et Comptabilité",   // Finance & Accounting
  "Langues étrangères",        // Foreign Languages
  "Psychologie",               // Psychology
  "Photographie",              // Photography
  "Musique",                   // Music
  "Histoire",                  // History
  "Écriture Créative"          // Creative Writing
].filter(skill => !data.includes(skill));

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-3xl font-bold mb-5 text-gray-800">Quels sont vos centres d’intérêt ?</h3>
        <p className="text-xl text-gray-600 mb-8">
           Ajoutez vos centres d’intérêt pour que nous puissions vous suggérer des formations adaptées à vos envies 
        </p>
        
        <div className="flex gap-4 mb-8">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ajoutez une compétence..."
            className="flex-1 text-lg h-14"
          />
          <Button 
            type="button" 
            onClick={handleAddSkill} 
            disabled={!newSkill.trim()}
            className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-lg text-white transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed px-8 h-14"
          >
            Ajouter
          </Button>
        </div>
        
        {data.length > 0 && (
          <div className="mb-10">
            <Label className="mb-4 block text-xl font-medium">Vos centres d’intérêt</Label>
            <div className="flex flex-wrap gap-4">
              {data.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant={getBadgeVariant(index)} 
                  className="py-2 pl-3 pr-2 flex items-center gap-3 text-lg cursor-pointer hover:bg-gray-700"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:bg-white/20 rounded-full p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {suggestedSkills.length > 0 && (
          <div>
            <Label className="mb-4 block text-xl font-medium">Suggestion</Label>
            <div className="flex flex-wrap gap-4">
              {suggestedSkills.slice(0, 10).map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="cursor-pointer py-1 px-2 text-lg text-black hover:bg-gray-400"
                  onClick={() => {
                    updateData([...data, skill]);
                  }}
                >
                  + {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default interrestsForm;
