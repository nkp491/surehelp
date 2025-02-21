
import FeatureCard from "./FeatureCard";

const features = [{
  title: "Enter lead information with ease",
  description: "Use our client Assessment Form to easily input client data to track and manage your leads through the entire sales pipeline with our intuitive system.",
  imagePath: "/lovable-uploads/23ae3a68-49e1-4541-aebb-35e91813f481.png",
  altText: "Lead Information Form"
}, {
  title: "Manage your client book of business",
  description: "You'll grow your client book of business with every assessment form submission—all your leads in one place.",
  imagePath: "/lovable-uploads/ce47041b-fff4-44bf-95c5-aa1550bd745b.png",
  altText: "Client Management Dashboard"
}, {
  title: "KPI insights to track your cashflow",
  description: "The KPI tracker allows you to log your status: leads, calls, contacts, scheduled, sits, sales, and AP. You'll be able to summarize your progress and track your cashflow.",
  imagePath: "/lovable-uploads/1c140e77-c297-47fb-a6db-01e7c2e99114.png",
  altText: "KPI Tracking Dashboard"
}, {
  title: "Collaborate with your team",
  description: "Get access to the team bulletin and never miss an announcement again.",
  imagePath: "/lovable-uploads/87f39ac5-3898-4a40-8f90-4a3b2bfe6a19.png",
  altText: "Team Bulletin Board"
}, {
  title: "Streamlined metric dashboards for managers",
  description: "Managers can view their team's KPI metrics for the day, week, month, and more.",
  imagePath: "/lovable-uploads/81ac6ea8-c2b9-484b-99fa-0a0abf976b32.png",
  altText: "Success Calculator Dashboard"
}, {
  title: "Link your accounts to agents and managers",
  description: "By linking accounts, agents and teams can organize their sales process and move even faster",
  imagePath: "/lovable-uploads/eb797aa2-dd99-4acc-86fe-44c70da68a43.png",
  altText: "Team Management Dashboard"
}];

const FeaturesGrid = () => {
  return (
    <section className="w-full py-24">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-4 text-white">Agent Hub's Powerful Features</h2>
        <p className="text-lg text-white/80 text-center mb-16 max-w-2xl mx-auto">
          Everything you need to manage your insurance business effectively in one place.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
