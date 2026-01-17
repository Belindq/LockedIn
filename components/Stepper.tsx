import React from "react";

interface Step {
    label: string;
    number: number;
}

interface StepperProps {
    steps: Step[];
    currentStep: number; // 1-indexed
}

export function Stepper({ steps, currentStep }: StepperProps) {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isActive = stepNumber === currentStep;
                    const isUpcoming = stepNumber > currentStep;

                    return (
                        <React.Fragment key={step.number}>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 border-2 flex items-center justify-center font-pixel text-[10px] transition-all ${isCompleted
                                        ? "bg-primary border-primary text-white"
                                        : isActive
                                            ? "bg-primary border-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-background"
                                            : "bg-card border-border text-gray-500"
                                        }`}
                                    aria-current={isActive ? "step" : undefined}
                                >
                                    {stepNumber}
                                </div>
                                <span
                                    className={`mt-2 text-[8px] font-pixel ${isActive ? "text-primary" : "text-gray-500"
                                        }`}
                                >
                                    {step.label.toUpperCase()}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 mx-2 border-t-2 ${isCompleted ? "border-primary" : "border-border"
                                        }`}
                                    style={{ marginTop: "-1.5rem" }}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
