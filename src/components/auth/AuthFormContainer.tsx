import { cn } from "@/lib/utils";

interface AuthFormContainerProps {
  children: React.ReactNode;
  className?: string;
}

const AuthFormContainer = ({ children, className }: AuthFormContainerProps) => {
  return (
    <div className={cn(
      "bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-md w-full",
      className
    )}>
      {children}
    </div>
  );
};

export default AuthFormContainer;