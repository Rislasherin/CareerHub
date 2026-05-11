import React from 'react';

interface Step {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number; // 1-indexed
  roleType?: 'student' | 'hr' | 'organizer';
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, roleType = 'student' }) => {
  const getRoleColors = () => {
    switch (roleType) {
      case 'student': return 'bg-student-primary';
      case 'hr': return 'bg-company-primary';
      case 'organizer': return 'bg-organizer-primary';
      default: return 'bg-indigo-600';
    }
  };

  return (
    <div className="flex items-center justify-between w-full mb-12">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                  ${isCompleted ? `${getRoleColors()} text-white` : ''}
                  ${isActive ? `${getRoleColors()} text-white ring-4 ring-offset-2 ring-indigo-500/20` : ''}
                  ${!isActive && !isCompleted ? 'bg-slate-100 text-slate-400' : ''}
                `}
              >
                {isCompleted ? '✓' : stepNumber}
              </div>
              <div className="text-center absolute top-12 whitespace-nowrap">
                <p className={`text-xs font-bold ${isActive ? 'text-text-main' : 'text-text-muted'}`}>{step.title}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 bg-slate-100 relative -top-3">
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-500 ${getRoleColors()}`} 
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
