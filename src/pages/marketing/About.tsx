
import NavBar from "@/components/marketing/NavBar";
import Footer from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Target, Users, Shield } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-b from-[#0096C7] to-[#002DCB]">
      <NavBar />
      <main className="w-screen">
        <div className="relative isolate pt-24">
          <div className="w-full px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  About SureHelp
                </h1>
                <p className="mt-6 text-lg leading-8 text-white/80 max-w-2xl mx-auto">
                  We're dedicated to revolutionizing the insurance industry by providing cutting-edge tools 
                  that empower insurance professionals to work smarter, not harder.
                </p>
              </div>

              <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <Target className="h-12 w-12 text-white mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Our Mission</h3>
                  <p className="text-white/80">
                    To simplify and streamline insurance operations, enabling professionals 
                    to focus on what matters most - serving their clients.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <Users className="h-12 w-12 text-white mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Our Team</h3>
                  <p className="text-white/80">
                    A dedicated group of insurance and technology experts working 
                    together to create the best solutions for insurance professionals.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <Shield className="h-12 w-12 text-white mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Our Values</h3>
                  <p className="text-white/80">
                    Innovation, integrity, and excellence in everything we do to 
                    support the success of our clients.
                  </p>
                </div>
              </div>

              <div className="mt-20 text-center">
                <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Insurance Business?</h2>
                <Button 
                  onClick={() => navigate('/auth')}
                  size="lg"
                  className="bg-white/25 text-[#33C3F0] hover:bg-white"
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
