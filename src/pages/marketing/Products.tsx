
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Products = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="border-b bg-white/50 backdrop-blur-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-[#2A6F97] cursor-pointer" 
                onClick={() => navigate('/')}>SureHelp</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/products')}>
                Products
              </Button>
              <Button variant="ghost" onClick={() => navigate('/pricing')}>
                Pricing
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Our Products
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Comprehensive solutions for insurance professionals
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {[
              {
                title: "Client Assessment",
                description: "Streamlined forms for efficient client data collection",
                features: ["Custom form builder", "Real-time validation", "Auto-save feature"]
              },
              {
                title: "Analytics Dashboard",
                description: "Powerful insights into your business performance",
                features: ["Performance metrics", "Custom reports", "Data visualization"]
              },
              {
                title: "Team Management",
                description: "Collaborate effectively with your team",
                features: ["Role-based access", "Team analytics", "Task management"]
              }
            ].map((product) => (
              <div key={product.title} className="flex flex-col bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900">{product.title}</h2>
                <p className="mt-4 text-gray-600">{product.description}</p>
                <ul className="mt-8 space-y-3">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <CheckCircle className="h-6 w-6 text-[#2A6F97]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;
