import FeatureCard from "./FeatureCard";

const features = [
  {
    title: "Lead Management",
    description: "Track and manage your leads through the entire sales pipeline with our intuitive system.",
    imagePath: "/lovable-uploads/e18fc40a-264d-405d-909a-59abaf978727.png",
    altText: "Health Assessment Form Interface"
  },
  {
    title: "Performance Analytics",
    description: "Real-time insights into your team's performance with detailed metrics and reports.",
    imagePath: "/placeholder.svg",
    altText: "Analytics Dashboard"
  },
  {
    title: "Client Assessment",
    description: "Streamlined client evaluation process with customizable assessment forms.",
    imagePath: "/placeholder.svg",
    altText: "Client Assessment Tools"
  },
  {
    title: "Team Collaboration",
    description: "Seamlessly work together with integrated team communication and sharing tools.",
    imagePath: "/placeholder.svg",
    altText: "Team Collaboration Features"
  },
  {
    title: "Automated Workflows",
    description: "Automate repetitive tasks and streamline your business processes.",
    imagePath: "/placeholder.svg",
    altText: "Workflow Automation"
  },
  {
    title: "Document Management",
    description: "Centralized document storage and management for all your client files.",
    imagePath: "/placeholder.svg",
    altText: "Document Management System"
  }
];

const FeaturesGrid = () => {
  return (
    <section className="w-full py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-4 text-white">Powerful Features</h2>
        <p className="text-white/80 text-center mb-16 max-w-2xl mx-auto">
          Everything you need to manage your insurance business effectively in one place.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              {...feature}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
