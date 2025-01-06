import FormContainer from "@/components/FormContainer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Form Repository
          </h1>
          <p className="text-lg text-gray-600">
            Fill out the form below to store your information
          </p>
        </div>
        <FormContainer />
      </div>
    </div>
  );
};

export default Index;