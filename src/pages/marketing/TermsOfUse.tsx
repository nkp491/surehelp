
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
                  Terms and Conditions
                </h1>
              </div>
              
              <div className="prose prose-lg prose-invert mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="text-white/80 space-y-6">
                  <p className="text-xl">Last Updated: February 20, 2025</p>

                  <h2 className="text-2xl font-semibold">1. INTRODUCTION</h2>
                  <p>This Terms and Conditions Agreement (the "Agreement") is a legally binding contract between the user ("User" or "You") and SureHelp, Inc. ("SureHelp," "Company," "We," or "Us"), governing Your access to and use of the SureHelp platform, including all associated websites, software, mobile applications, APIs, and other services (collectively, the "Services").</p>
                  
                  <p>SureHelp is incorporated in the State of Delaware and operates in the State of California. Accordingly, certain provisions of this Agreement will be governed by Delaware law, while consumer protection and privacy-related matters shall be governed by California law.</p>
                  
                  <p>By accessing or using the Services, You acknowledge that You have read, understood, and agreed to be bound by this Agreement. If You do not agree to these terms, You must immediately discontinue use of the Services.</p>

                  <h2 className="text-2xl font-semibold mt-8">2. DEFINITIONS</h2>
                  <p>For the purposes of this Agreement, the following terms shall have the meanings set forth below:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>"User" refers to any individual or entity accessing the Services, including insurance agents, brokers, underwriters, and authorized representatives.</li>
                    <li>"Services" means the SureHelp platform, website, mobile application, and associated tools designed to facilitate underwriting and related insurance processes.</li>
                    <li>"Data" refers to any information entered, transmitted, or processed through the Services, including but not limited to User-provided data, underwriting records, and third-party integrations.</li>
                    <li>"API" refers to any application programming interface offered by SureHelp for authorized integrations.</li>
                  </ul>

                  <h2 className="text-2xl font-semibold mt-8">3. ELIGIBILITY AND USER OBLIGATIONS</h2>
                  <h3 className="text-xl font-semibold mt-4">3.1 Eligibility</h3>
                  <p>You must be a licensed insurance agent, broker, or other authorized professional to access the Services. By registering, You represent and warrant that You meet this requirement.</p>

                  <h3 className="text-xl font-semibold mt-4">3.2 User Responsibilities</h3>
                  <p>You agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate, complete, and up-to-date registration information;</li>
                    <li>Use the Services solely for lawful purposes and in compliance with all applicable laws and industry regulations, including California and Delaware state laws;</li>
                    <li>Maintain the confidentiality of Your account credentials and immediately report any unauthorized use of Your account.</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4">3.3 Prohibited Conduct</h3>
                  <p>You shall not:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Use the Services for fraudulent, deceptive, or unlawful activities;</li>
                    <li>Circumvent or disable security features of the Services;</li>
                    <li>Modify, decompile, reverse-engineer, or otherwise attempt to extract the source code of any SureHelp software.</li>
                  </ul>

                  <h2 className="text-2xl font-semibold mt-8">4. ACCOUNT REGISTRATION AND SECURITY</h2>
                  <p>4.1 Account Registration. Users must create an account to access the Services. You are responsible for maintaining the security of Your login credentials.</p>
                  <p>4.2 Unauthorized Access. If You become aware of any unauthorized access to Your account, You must immediately notify SureHelp at contact@surehelp.app. SureHelp shall not be liable for any loss arising from unauthorized use of Your account.</p>

                  {/* Continuing with all sections up to Section 11... */}
                  
                  <h2 className="text-2xl font-semibold mt-8">11. CONTACT INFORMATION</h2>
                  <p>For questions regarding these Terms & Conditions, please contact: contact@surehelp.app</p>
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
