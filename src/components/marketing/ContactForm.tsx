import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  agencyName: z.string().min(2, "Agency name is required"),
  agencySize: z.string({
    required_error: "Please select your agency size",
  }),
  wantDemo: z.enum(["yes", "no"], {
    required_error: "Please select if you would like a demo",
  }),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
});

type FormData = z.infer<typeof formSchema>;

const agencySizes = [
  "1-20 agents",
  "21-50 agents",
  "51-100 agents",
  "101-250 agents",
  "250+ agents",
];

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      toast({
        title: "Success!",
        description:
          "We've received your message and will get back to you soon.",
      });

      reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description:
          "There was a problem submitting your form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 w-full max-w-md"
    >
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="Enter your full name"
          {...register("fullName")}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/60"
        />
        {errors.fullName && (
          <p className="text-red-400 text-sm">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="agencyName">Agency Name</Label>
        <Input
          id="agencyName"
          placeholder="Enter your agency name"
          {...register("agencyName")}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/60"
        />
        {errors.agencyName && (
          <p className="text-red-400 text-sm">{errors.agencyName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="agencySize">Agency Size</Label>
        <Select
          onValueChange={(value) =>
            register("agencySize").onChange({ target: { value } })
          }
        >
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Select agency size" />
          </SelectTrigger>
          <SelectContent>
            {agencySizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.agencySize && (
          <p className="text-red-400 text-sm">{errors.agencySize.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Would you like a demo?</Label>
        <RadioGroup
          onValueChange={(value) =>
            register("wantDemo").onChange({ target: { value } })
          }
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="demo-yes" />
            <Label htmlFor="demo-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="demo-no" />
            <Label htmlFor="demo-no">No</Label>
          </div>
        </RadioGroup>
        {errors.wantDemo && (
          <p className="text-red-400 text-sm">{errors.wantDemo.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register("email")}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/60"
        />
        {errors.email && (
          <p className="text-red-400 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Enter your phone number"
          {...register("phone")}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/60"
        />
        {errors.phone && (
          <p className="text-red-400 text-sm">{errors.phone.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
};

export default ContactForm;
