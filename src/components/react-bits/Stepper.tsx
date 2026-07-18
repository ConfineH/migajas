"use client";

import React, {
  useState,
  Children,
  useRef,
  useLayoutEffect,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  initialStep?: number;
  step?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  hideFooter?: boolean;
  hideIndicators?: boolean;
  disableStepIndicators?: boolean;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (clicked: number) => void;
  }) => ReactNode;
}

export default function Stepper({
  children,
  initialStep = 1,
  step: controlledStep,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = "",
  stepContainerClassName = "",
  contentClassName = "",
  footerClassName = "",
  hideFooter = false,
  hideIndicators = false,
  disableStepIndicators = false,
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = "Atrás",
  nextButtonText = "Continuar",
  renderStepIndicator,
  className = "",
  ...rest
}: StepperProps) {
  const [internalStep, setInternalStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);
  const currentStep = controlledStep ?? internalStep;
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    if (controlledStep === undefined) {
      setInternalStep(newStep);
    }
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  return (
    <div className={`flex w-full flex-col ${className}`} {...rest}>
      <div
        className={`mx-auto w-full ${stepCircleContainerClassName}`}
      >
        <div
          className={`flex items-center justify-center gap-2 ${stepContainerClassName}`}
        >
          {!hideIndicators
            ? stepsArray.map((_, index) => {
                const stepNumber = index + 1;
                const isNotLastStep = index < totalSteps - 1;
                return (
                  <React.Fragment key={stepNumber}>
                    {renderStepIndicator ? (
                      renderStepIndicator({
                        step: stepNumber,
                        currentStep,
                        onStepClick: (clicked) => {
                          setDirection(clicked > currentStep ? 1 : -1);
                          updateStep(clicked);
                        },
                      })
                    ) : (
                      <StepIndicator
                        step={stepNumber}
                        disableStepIndicators={disableStepIndicators}
                        currentStep={currentStep}
                        onClickStep={(clicked) => {
                          setDirection(clicked > currentStep ? 1 : -1);
                          updateStep(clicked);
                        }}
                      />
                    )}
                    {isNotLastStep ? (
                      <StepConnector isComplete={stepNumber < currentStep} />
                    ) : null}
                  </React.Fragment>
                );
              })
            : null}
        </div>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={contentClassName}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && !hideFooter ? (
          <div
            className={`mt-6 flex items-center justify-between gap-3 ${footerClassName}`}
          >
            <div>
              {currentStep !== 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-sm font-medium text-muted transition-colors hover:text-foreground"
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={isLastStep ? handleComplete : handleNext}
              className="btn-terracotta inline-flex min-h-10 items-center justify-center rounded-full px-5 py-2 text-sm font-medium text-white transition-all"
              {...nextButtonProps}
            >
              {isLastStep ? "Completar" : nextButtonText}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface StepContentWrapperProps {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: ReactNode;
  className?: string;
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className = "",
}: StepContentWrapperProps) {
  const [parentHeight, setParentHeight] = useState(0);

  return (
    <motion.div
      style={{ position: "relative", overflow: "hidden" }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: "spring", duration: 0.4 }}
      className={className}
    >
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        {!isCompleted ? (
          <SlideTransition
            key={currentStep}
            direction={direction}
            onHeightReady={setParentHeight}
          >
            {children}
          </SlideTransition>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

interface SlideTransitionProps {
  children: ReactNode;
  direction: number;
  onHeightReady: (height: number) => void;
}

function SlideTransition({
  children,
  direction,
  onHeightReady,
}: SlideTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      onHeightReady(containerRef.current.offsetHeight);
    }
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35 }}
      style={{ position: "absolute", left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? "-12%" : "12%",
    opacity: 0,
  }),
  center: {
    x: "0%",
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? "8%" : "-8%",
    opacity: 0,
  }),
};

interface StepProps {
  children: ReactNode;
}

export function Step({ children }: StepProps) {
  return <>{children}</>;
}

interface StepIndicatorProps {
  step: number;
  currentStep: number;
  onClickStep: (clicked: number) => void;
  disableStepIndicators?: boolean;
}

function StepIndicator({
  step,
  currentStep,
  onClickStep,
  disableStepIndicators = false,
}: StepIndicatorProps) {
  const status =
    currentStep === step
      ? "active"
      : currentStep < step
        ? "inactive"
        : "complete";

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators && step < currentStep) {
      onClickStep(step);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-current={status === "active" ? "step" : undefined}
      className={`relative outline-none focus-visible:ring-2 focus-visible:ring-sage-strong focus-visible:ring-offset-2 ${
        disableStepIndicators || step > currentStep
          ? "pointer-events-none"
          : "cursor-pointer"
      }`}
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: {
            scale: 1,
            backgroundColor: "var(--sage-muted)",
            color: "var(--muted)",
          },
          active: {
            scale: 1.05,
            backgroundColor: "var(--sage-strong)",
            color: "#ffffff",
          },
          complete: {
            scale: 1,
            backgroundColor: "var(--sage-light)",
            color: "var(--sage-strong)",
          },
        }}
        transition={{ duration: 0.3 }}
        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shadow-soft"
      >
        {status === "complete" ? (
          <CheckIcon className="h-4 w-4 text-sage-strong" />
        ) : (
          <span>{step}</span>
        )}
      </motion.div>
    </motion.button>
  );
}

function StepConnector({ isComplete }: { isComplete: boolean }) {
  const lineVariants: Variants = {
    incomplete: { scaleX: 0, backgroundColor: "var(--border)" },
    complete: { scaleX: 1, backgroundColor: "var(--sage-strong)" },
  };

  return (
    <div className="relative h-0.5 w-8 origin-left sm:w-12">
      <div className="absolute inset-0 rounded-full bg-border" />
      <motion.div
        className="absolute inset-0 origin-left rounded-full"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? "complete" : "incomplete"}
        transition={{ duration: 0.35 }}
      />
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.05, type: "tween", ease: "easeOut", duration: 0.25 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
