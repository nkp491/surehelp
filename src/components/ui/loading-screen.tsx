
interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = "Loading..." }: LoadingScreenProps) => {
  return (
    // <div className="fixed inset-0 flex items-center justify-center bg-background/50">
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="text-lg font-medium">{message}</div>
    </div>
  );
};

export default LoadingScreen;
