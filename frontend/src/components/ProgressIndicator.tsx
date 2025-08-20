import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const ProgressIndicator = ({ currentStep, totalSteps, stepLabels }: ProgressIndicatorProps) => {
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;
          
          return (
            <div key={stepNumber} className="flex items-center">
              <motion.div
                className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ?{
                  isCompleted
                    ? 'bg-orange-500 text-white'
                    : isCurrent
                    ? 'bg-purple-600 text-white ring-4 ring-purple-200'
                    : 'bg-gray-200 text-gray-500'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </motion.div>
              
              {index < totalSteps - 1 && (
                <div
                  className={`w-16 h-1 mx-2 rounded-full transition-all duration-500 ?{
                    isCompleted ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between mt-3 px-2">
        {stepLabels.map((label, index) => (
          <span
            key={index}
            className={`text-xs font-medium transition-colors duration-300 ?{
              currentStep > index + 1
                ? 'text-orange-600'
                : currentStep === index + 1
                ? 'text-purple-600'
                : 'text-gray-400'
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};
