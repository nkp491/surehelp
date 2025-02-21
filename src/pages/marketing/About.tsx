
import NavBar from "@/components/marketing/NavBar";
import Footer from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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

              {/* Mission Section */}
              <div className="mt-20">
                <h2 className="text-3xl font-bold text-white mb-6">Mission</h2>
                <p className="text-lg leading-8 text-white/80 max-w-3xl">
                  At SureHelp, we are dedicated to making insurance agents' lives easier by organizing 
                  the underwriting process and optimizing sales workflows. Every day, agents waste 
                  countless hours jumping between different systems, losing track of leads, and 
                  struggling to measure performance. We provide a seamless, all-in-one platform 
                  designed to bring clarity, efficiency, and success to your workflow.
                </p>
              </div>

              {/* Story Section */}
              <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="h-[400px] rounded-2xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
                    alt="Mission" 
                    className="w-full h-full object-cover"
                  />
                </div>
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
                    technology, setting SureHelp apart from other tools. By combining practical 
                    insurance knowledge with advanced technological solutions, we've created an 
                    intuitive, easy-to-use platform designed specifically for insurance agents and IMOs.
                  </p>
                </div>
              </div>

              {/* Team Section */}
              <div className="mt-32">
                <h2 className="text-3xl font-bold text-white text-center mb-16">Meet Our Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    {
                      image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
                      name: "John Cooper",
                      role: "Chief Executive Officer",
                      description: "20+ years of insurance industry expertise, driving innovation in insurtech."
                    },
                    {
                      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
                      name: "Sarah Mitchell",
                      role: "Chief Technology Officer",
                      description: "Tech visionary with a passion for creating intuitive software solutions."
                    },
                    {
                      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
                      name: "Michael Chang",
                      role: "Head of Product",
                      description: "Product strategist focused on delivering value through user-centric design."
                    },
                    {
                      image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9",
                      name: "Emily Rodriguez",
                      role: "Customer Success Lead",
                      description: "Dedicated to ensuring our clients achieve their business goals."
                    }
                  ].map((member, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                      <div className="h-48 mb-6 rounded-xl overflow-hidden">
                        <img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
                      <p className="text-sm text-white/80 mb-4">{member.role}</p>
                      <p className="text-sm text-white/60">{member.description}</p>
                    </div>
                  ))}
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

