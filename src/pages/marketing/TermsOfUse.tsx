
import NavBar from "@/components/marketing/NavBar";
import Footer from "@/components/marketing/Footer";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-b from-[#0096C7] to-[#002DCB]">
      <NavBar />
      <main className="w-screen">
        <div className="relative isolate pt-24">
          <div className="w-full px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  Terms and Conditions Template
                </h1>
              </div>
              
              <div className="prose prose-lg prose-invert mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div contentEditable className="text-white/80 space-y-6 focus:outline-none">
                  <p>Paste your Terms and Conditions here.</p>
                  <p>The text will be automatically formatted.</p>
                  <p>Click to edit this text.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfUse;
