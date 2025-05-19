import React from "react";
import { Progress } from "@/components/ui/progress";

const ProgressIndicator = ({ currentStep, totalSteps }) => {
  const steps = [
    { id: 1, name: "Compétences" },
    { id: 2, name: "Langues" },
    { id: 3, name: "Certifications" },
    { id: 4, name: "Informations bancaires" },
  ];

  // Calculate progress percentage
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mt-6">
      {/* Desktop view */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between w-full mb-4">
          {steps.map(step => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold ${
                step.id === currentStep
                  ? "bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md"
                  : step.id < currentStep
                    ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white"
                    : "bg-gray-100 text-gray-500"
              }`}>
                {step.id < currentStep ? '✓' : step.id}
              </div>
              <span className={`text-base mt-3 font-medium ${
                step.id <= currentStep ? "text-gray-900" : "text-gray-500"
              }`}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
        <Progress
          value={progressPercentage}
          className="h-3 bg-teal-100"
          indicatorClassName="bg-gradient-to-r from-blue-600 to-teal-500"
        />
      </div>

      {/* Mobile progress bar */}
      <div className="sm:hidden">
        <p className="text-lg font-medium mb-3 text-gray-700">
          Étape {currentStep} sur {totalSteps}: {steps[currentStep - 1].name}
        </p>
        <Progress
          value={progressPercentage}
          className="h-3 bg-teal-100"
          indicatorClassName="bg-gradient-to-r from-blue-600 to-teal-500"
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;
