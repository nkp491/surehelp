import NavBar from "@/components/marketing/NavBar";
import Footer from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, UserRound } from "lucide-react";

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
                  Transforming Chaos into Clarity
                </h1>
              </div>

              <div className="mt-20 grid grid-cols-1 lg:grid-cols-[45%_55%] gap-16 items-start">
                {/* Large Image on Left */}
                <div className="h-[600px] rounded-2xl overflow-hidden lg:pl-0">
                  <img 
                    src="/lovable-uploads/12c860c7-e4fb-44ff-b5c2-4d397dcc14c1.png"
                    alt="Mission" 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>

                {/* Content on Right */}
                <div className="space-y-20 lg:pr-12">
                  {/* Mission Section */}
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-6">Mission</h2>
                    <p className="text-lg leading-8 text-white/80">
                      Every day, agents waste countless hours jumping between different systems, losing track of leads, and 
                      struggling to measure performance. At SureHelp, we are dedicated to providing an all-in-one platform 
                      designed to organize the sales workflow and utilizing real-time data to work for you.
                    </p>
                  </div>

                  {/* Story Section */}
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-white">Our Story</h2>
                    <p className="text-lg leading-relaxed text-white/80">
                      SureHelp was founded when Harold and Samir—both seasoned leaders in the life 
                      insurance industry—recognized the urgent need to modernize and streamline an 
                      agent's sales workflow. Their vision for a more efficient, technology-driven 
                      solution led them to partner with Nielsen and Tho, two experienced technologists 
                      with over a decade of expertise in building innovative digital platforms.
                    </p>
                    <p className="text-lg leading-relaxed text-white/80">
                      This powerful collaboration brings together deep industry insight and cutting-edge 
                      technology, setting SureHelp apart from other tools. By combining insurance 
                      knowledge with advanced tech solutions, we've created the Agent Hub specifically 
                      for insurance agents and IMOs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Section */}
              <div className="mt-32">
                <h2 className="text-3xl font-bold text-white text-center mb-16">Meet Our Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    {
                      name: "Nielsen Aragon",
                      description: "Tech visionary with a passion for creating intuitive software solutions."
                    },
                    {
                      name: "Tho Nguyen",
                      description: "Product strategist focused on delivering value through user-centric design."
                    },
                    {
                      name: "Harold Durana",
                      description: "Has a gold jacket, do we need to say more?"
                    },
                    {
                      name: "Samir Palavra",
                      description: "15+ years of insurance industry expertise, driving innovation in insurtech."
                    }
                  ].map((member, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                      <div className="flex justify-center items-center h-48 mb-6">
                        <UserRound className="w-32 h-32 text-white/80" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-4">{member.name}</h3>
                      <p className="text-sm text-white/60">{member.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-20 text-center">
                <h2 className="text-3xl font-bold text-white mb-6">Try Agent Hub Now</h2>
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
