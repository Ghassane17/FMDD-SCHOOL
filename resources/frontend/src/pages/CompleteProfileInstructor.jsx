import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import ProgressIndicator from "../components/formateurs/profile-completion-formateur/ProgressIndicator";
import SkillsForm from "../components/formateurs/profile-completion-formateur/SkillsForm";
import LanguagesForm from "../components/formateurs/profile-completion-formateur/LanguagesForm";
import CertificationsForm from "../components/formateurs/profile-completion-formateur/CertificationsForm";
import BankInfoForm from "../components/formateurs/profile-completion-formateur/BankInfoForm";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {completeProfile} from '../services/api.js'

const CompleteProfileInstructor = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    skills: [],
    languages: [],
    certifications: [],
    bankInfo: {
      iban: "",
      bankName: "",
      paymentMethod: ""
    }
  });

  const updateSkills = (skills) => {
    setFormData(prev => ({ ...prev, skills }));
  };

  const updateLanguages = (languages) => {
    setFormData(prev => ({ ...prev, languages }));
  };

  const updateCertifications = (certifications) => {
    setFormData(prev => ({ ...prev, certifications }));
  };

  const updateBankInfo = (bankInfo) => {
    setFormData(prev => ({ ...prev, bankInfo }));
  };

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            // Call the API to save the profile
            completeProfile('instructor',formData)
                .then(() => {
                    toast.success("profil instructor a été complété avec succès! Redirection vers la page de connexion...");
                    setTimeout(() => navigate("/login"), 1500);
                })
                .catch(() => {
                    toast.error("Erreur lors de la sauvegarde du profil.");
                });
        }
    };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Check if current step data is valid for enabling next button
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.skills.length > 0;
      case 2:
        return formData.languages.length > 0;
      case 3:
        return formData.certifications.length >= 0;
      case 4:
        // Bank info is optional
        return true;
      default:
        return false;
    }
  };

  // Render the form based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <SkillsForm data={formData.skills} updateData={updateSkills} />;
      case 2:
        return <LanguagesForm data={formData.languages} updateData={updateLanguages} />;
      case 3:
        return <CertificationsForm data={formData.certifications} updateData={updateCertifications} />;
      case 4:
        return <BankInfoForm data={formData.bankInfo} updateData={updateBankInfo} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white min-h-screen">

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-1 text-gray-900">Complétez votre profil</h2>
            <p className="text-gray-600 text-sm mb-4">
              Quelques informations supplémentaires pour perfectionner votre profil formateur
            </p>

            <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
          </div>

          <div className="mb-6">
            {renderStepContent()}
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 text-lg px-6 h-14 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour
            </Button>

            <div className="flex gap-4">
              {currentStep === 4 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  className="text-lg px-6 h-14 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Ignorer pour le moment
                </Button>
              )}

              <Button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid()}
                className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-lg text-white flex items-center gap-2 px-8 h-14 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {currentStep < totalSteps ? "Suivant" : "Terminer"}
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfileInstructor;
