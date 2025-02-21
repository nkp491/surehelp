
import ContactForm from "./ContactForm";

const ContactSection = () => {
  return (
    <section className="w-full py-24 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        <div className="text-left">
          <h2 className="text-4xl font-bold mb-4 text-white">Contact Us</h2>
          <p className="text-lg text-white/80">
            Ready to transform your insurance business? Get in touch with us today and discover how Agent Hub can help streamline your operations.
          </p>
        </div>
        <div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
