import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CertificationsForm = ({ data, updateData }) => {
  const [certification, setCertification] = useState({
    name: "",
    institution: ""
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCertification(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddCertification = () => {
    if (certification.name.trim() && certification.institution.trim()) {
      updateData([...data, { ...certification }]);
      setCertification({ name: "", institution: "" });
    }
  };
  
  const handleRemoveCertification = (index) => {
    updateData(data.filter((_, i) => i !== index));
  };

  // Different colors for certificate badges
  const getCertificateColor = (index) => {
    const colors = [
      "bg-blue-50 text-blue-600",
      "bg-purple-50 text-purple-600",
      "bg-green-50 text-green-600",
      "bg-amber-50 text-amber-600",
      "bg-rose-50 text-rose-600",
      "bg-cyan-50 text-cyan-600"
    ];
    return colors[index % colors.length];
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-3xl font-bold mb-5 text-gray-800">Vos certifications et diplômes</h3>
        <p className="text-xl text-gray-600 mb-8">
          Ajoutez vos certifications et diplômes pour renforcer votre crédibilité auprès des étudiants.
        </p>
        
        <Card className="mb-10">
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="certificationName" className="text-xl mb-3 block">
                Nom du diplôme ou de la certification
              </Label>
              <Input
                id="certificationName"
                name="name"
                value={certification.name}
                onChange={handleChange}
                placeholder="Ex: Master en Intelligence Artificielle"
                className="text-lg h-14"
              />
            </div>
            
            <div>
              <Label htmlFor="institution" className="text-xl mb-3 block">Établissement</Label>
              <Input
                id="institution"
                name="institution"
                value={certification.institution}
                onChange={handleChange}
                placeholder="Ex: École Polytechnique"
                className="text-lg h-14"
              />
            </div>
            
            <Button 
              type="button" 
              onClick={handleAddCertification} 
              disabled={!certification.name.trim() || !certification.institution.trim()}
              className="w-full text-lg py-7 mt-4 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter cette certification
            </Button>
          </CardContent>
        </Card>
        
        {data.length > 0 && (
          <div>
            <Label className="mb-5 block text-xl font-medium">Vos certifications ({data.length})</Label>
            <div className="space-y-5">
              {data.map((cert, index) => (
                <Card key={index} className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Award className="h-7 w-7 text-blue-600" />
                      <div>
                        <p className="font-medium text-xl">{cert.name}</p>
                        <p className="text-lg text-gray-500">{cert.institution}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCertification(index)}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationsForm;
