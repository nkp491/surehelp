
interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-grid bg-gradient-to-b from-[#e6e9f0] via-[#eef1f5] to-white">
      <div className="container mx-auto min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
