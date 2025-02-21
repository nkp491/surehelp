
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
                  SureHelp Terms & Conditions
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

                  <h2 className="text-2xl font-semibold mt-8">5. DATA PRIVACY, SECURITY, AND COMPLIANCE</h2>
                  <h3 className="text-xl font-semibold mt-4">5.1 Privacy Policy</h3>
                  <p>Your use of the Services is subject to SureHelp's Privacy Policy, which governs the collection, use, and storage of User Data.</p>

                  <h3 className="text-xl font-semibold mt-4">5.2 Compliance with Laws and Regulations</h3>
                  <p>SureHelp strives to comply with applicable data protection laws, including but not limited to the California Consumer Privacy Act (CCPA), the General Data Protection Regulation (GDPR), and the Health Insurance Portability and Accountability Act (HIPAA), where applicable. However, SureHelp does not guarantee full compliance with all regulatory frameworks across all jurisdictions.</p>
                  <p>Users are responsible for ensuring that their use of the Services aligns with their own legal and regulatory obligations. If you have specific compliance requirements, you should consult legal counsel before using SureHelp.</p>

                  <h3 className="text-xl font-semibold mt-4">5.3 Third-Party Data Sharing</h3>
                  <p>If You integrate SureHelp with third-party systems (e.g., CRMs, insurance carrier platforms), You acknowledge that SureHelp is not responsible for data handling by such third parties.</p>

                  <h2 className="text-2xl font-semibold mt-8">6. FORCE MAJEURE</h2>
                  <p>SureHelp shall not be held liable for any delay or failure in performance resulting from causes beyond its reasonable control, including but not limited to acts of God, natural disasters, war, labor disputes, cyber-attacks, telecommunications failures, government actions, or pandemic-related disruptions.</p>

                  <h2 className="text-2xl font-semibold mt-8">7. PAYMENT TERMS AND SUBSCRIPTIONS</h2>
                  <h3 className="text-xl font-semibold mt-4">7.1 Fees and Billing</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Certain features of the Services may require payment of subscription fees.</li>
                    <li>All fees are billed in advance on a monthly or yearly basis, as selected by the User at the time of purchase.</li>
                    <li>Users authorize SureHelp to charge the payment method on file for all applicable fees.</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4">7.2 Prorated Billing for Upgrades</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Users who upgrade from a monthly subscription to a yearly subscription within the first 30 days of their initial purchase will be eligible for a prorated credit based on their remaining unused monthly balance.</li>
                    <li>Example: If a User on a $50/month plan upgrades to a $500/year plan on Day 15 of their first month, SureHelp will apply a $25 credit (for the unused 15 days) toward the yearly plan.</li>
                    <li>Prorating is only available for upgrades and does not apply to mid-cycle cancellations or downgrades.</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4">7.3 No Refunds</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Except as required by law, all payments made to SureHelp are non-refundable.</li>
                    <li>No refunds or credits will be issued for partial months of service, downgrades, or unused subscription periods.</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4">7.4 Service Suspension for Non-Payment</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Failure to make timely payments may result in the suspension or termination of Your access to the Services.</li>
                    <li>SureHelp is not responsible for data loss or service interruptions caused by account suspension due to non-payment.</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4">7.5 Automatic Renewals & Cancellations</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Subscriptions automatically renew at the end of the billing cycle unless canceled by the User at least 24 hours before renewal.</li>
                    <li>Users can cancel their subscription through their account settings or by contacting SureHelp Support.</li>
                    <li>Upon cancellation, access to premium features will continue until the end of the current billing period.</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4">7.6 Pricing Changes and Limited-Time Offers</h3>
                  <p>SureHelp reserves the right to modify pricing for its Services at any time, including the introduction of limited-time promotional offers.</p>
                  <p>Promotional pricing is valid only for the period specified and does not guarantee continued access to the same rates.</p>
                  <p>If You purchase a subscription at a promotional rate, You acknowledge that future renewals, upgrades, or additional purchases may be subject to the standard pricing in effect at the time of renewal or purchase. SureHelp will make reasonable efforts to notify existing Users of any significant pricing changes that may impact their subscriptions.</p>
                  <p>By continuing to use the Services after a price change takes effect, You agree to the modified pricing terms. If You do not agree to such changes, Your sole remedy is to cancel Your subscription before the next billing cycle.</p>

                  <h2 className="text-2xl font-semibold mt-8">8. GOVERNING LAW AND DISPUTE RESOLUTION</h2>
                  <h3 className="text-xl font-semibold mt-4">8.1 Governing Law</h3>
                  <p>This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to conflict of law principles. However, matters relating to consumer protection, data privacy, and business operations in the State of California shall be governed by California law.</p>

                  <h3 className="text-xl font-semibold mt-4">8.2 Dispute Resolution</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Any corporate governance disputes shall be resolved in the courts of Delaware.</li>
                    <li>Any consumer-related disputes shall be resolved in the courts of California.</li>
                    <li>Arbitration: Any disputes arising under this Agreement that cannot be resolved informally shall be settled through binding arbitration in either Delaware or California, depending on the nature of the dispute.</li>
                  </ul>

                  <h2 className="text-2xl font-semibold mt-8">9. MODIFICATIONS TO THIS AGREEMENT</h2>
                  <p>SureHelp reserves the right to modify or update this Agreement at any time. Users will be notified of significant changes, and continued use of the Services after such modifications constitutes acceptance of the updated Terms.</p>

                  <h2 className="text-2xl font-semibold mt-8">10. MISCELLANEOUS</h2>
                  <h3 className="text-xl font-semibold mt-4">10.1 Severability</h3>
                  <p>If any provision of this Agreement is found to be unenforceable, the remainder shall remain in full force and effect.</p>

                  <h3 className="text-xl font-semibold mt-4">10.2 No Waiver</h3>
                  <p>Failure by SureHelp to enforce any provision shall not constitute a waiver of rights.</p>

                  <h3 className="text-xl font-semibold mt-4">10.3 Assignment</h3>
                  <p>Users may not assign their rights under this Agreement without prior written consent from SureHelp. SureHelp may assign this Agreement in connection with a merger, sale, or other business transfer.</p>

                  <h3 className="text-xl font-semibold mt-4">10.4 Independent Contractors</h3>
                  <p>Nothing in this Agreement shall be construed to create a partnership, joint venture, employment, or agency relationship between You and SureHelp.</p>

                  <h3 className="text-xl font-semibold mt-4">10.5 Survival</h3>
                  <p>The obligations set forth in Sections 5 (Data Privacy and Compliance), 6 (Force Majeure), 8 (Governing Law and Dispute Resolution), and 10 (Miscellaneous) shall survive termination of this Agreement.</p>

                  <h3 className="text-xl font-semibold mt-4">10.6 Entire Agreement</h3>
                  <p>This Agreement constitutes the entire understanding between the parties and supersedes all prior agreements.</p>

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
