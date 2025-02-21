
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
                  Terms of Use
                </h1>
              </div>
              
              <div className="prose prose-lg prose-invert mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <p className="text-white/80 mb-6">
                  Last updated: {new Date().toLocaleDateString()}
                </p>

                <div className="text-white/80 space-y-6">
                  {/* Section 1: Welcome */}
                  <div contentEditable className="focus:outline-none focus:ring-2 focus:ring-white/20 rounded p-2">
                    Welcome to SureHelp. By accessing and using our platform, you agree to be bound by these Terms of Use.
                  </div>

                  {/* Section 2: Acceptance */}
                  <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
                  <div contentEditable className="focus:outline-none focus:ring-2 focus:ring-white/20 rounded p-2">
                    By accessing and using the SureHelp platform, you acknowledge that you have read, 
                    understood, and agree to be bound by these terms.
                  </div>

                  {/* Section 3: User Responsibilities */}
                  <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. User Responsibilities</h2>
                  <div contentEditable className="focus:outline-none focus:ring-2 focus:ring-white/20 rounded p-2">
                    Users are responsible for maintaining the confidentiality of their account information 
                    and for all activities that occur under their account.
                  </div>

                  {/* Section 4: Privacy Policy */}
                  <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Privacy Policy</h2>
                  <div contentEditable className="focus:outline-none focus:ring-2 focus:ring-white/20 rounded p-2">
                    Your use of SureHelp is also governed by our Privacy Policy. Please review our Privacy 
                    Policy, which also governs the Platform and informs users of our data collection practices.
                  </div>

                  {/* You can add more sections by copying the pattern above */}
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
