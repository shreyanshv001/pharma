"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ContactUsPage() {
  const { user, isLoaded } = useUser();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: ""
  });
  const [buttonTrigger, setButtonTrigger] = useState("Send Message");
  const [result, setResult] = useState("");

  // Auto-populate form with user data when loaded
  useState(() => {
    if (isLoaded && user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.primaryEmailAddress?.emailAddress || ""
      }));
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setButtonTrigger("Sending...");
    setResult("Sending...");
    
    const formData = new FormData(event.currentTarget);
    const accessKey = process.env.NEXT_PUBLIC_CONTACT_ACCESS_KEY; 
    
    if (!accessKey) {
      setResult("❌ Configuration error. Please try again later.");
      setButtonTrigger("Send Message");
      return;
    }
    
    formData.append("access_key", accessKey);
    
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult("Form Submitted Successfully 🎉");
        setButtonTrigger("Form Submitted");
        // Reset form but keep user info
        setFormData(prev => ({ ...prev, message: "" }));
        event.currentTarget.reset();
        
        // Re-populate user fields after reset
        if (user) {
          setTimeout(() => {
            setFormData(prev => ({
              ...prev,
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              email: user.primaryEmailAddress?.emailAddress || ""
            }));
          }, 100);
        }
      } else {
        setResult("❌ " + data.message);
        setButtonTrigger("Send Message");
      }
    } catch (error) {
      setResult("❌ Network error. Please try again.");
      setButtonTrigger("Send Message");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
      
      <div className="relative px-4 sm:px-6 lg:px-8 pt-8 lg:pt-24 pb-32">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/60 rounded-full mb-6 border border-slate-700/30 shadow-2xl">
              <i className="ri-mail-line text-2xl text-blue-400"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-6 tracking-tight">
              Contact Us
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Have questions or feedback? We&apos;d love to hear from you and help with your
              <span className="text-slate-300"> pharmaceutical learning journey</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700/30 shadow-2xl overflow-hidden">
              <div className="p-6 bg-slate-700/30 border-b border-slate-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                    <i className="ri-send-plane-line text-blue-400"></i>
                  </div>
                  <h2 className="text-xl font-semibold text-white">Send us a Message</h2>
                </div>
                <p className="text-slate-400 text-sm mt-2">
                  {user ? "Your information has been pre-filled from your account" : "Fill out the form below and we'll get back to you"}
                </p>
              </div>

              <div className="p-8">
                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <div className="flex items-center gap-2">
                          <i className="ri-user-line text-blue-400"></i>
                          First Name
                        </div>
                      </label>
                      <Input
                        type="text"
                        name="first_name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                        className="bg-slate-700/60 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/25 transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <div className="flex items-center gap-2">
                          <i className="ri-user-line text-blue-400"></i>
                          Last Name
                        </div>
                      </label>
                      <Input
                        type="text"
                        name="last_name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                        className="bg-slate-700/60 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/25 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <div className="flex items-center gap-2">
                        <i className="ri-mail-line text-blue-400"></i>
                        Email Address
                      </div>
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="bg-slate-700/60 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/25 transition-all duration-300"
                      required
                    />
                  </div>

                  {/* Message Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <div className="flex items-center gap-2">
                        <i className="ri-message-2-line text-blue-400"></i>
                        Message
                      </div>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      className="w-full bg-slate-700/60 border border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/25 transition-all duration-300 rounded-lg px-3 py-2 resize-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={buttonTrigger === "Sending..." || buttonTrigger === "Form Submitted"}
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 disabled:from-slate-800 disabled:to-slate-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {buttonTrigger === "Sending..." ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-3"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <>
                        <i className="ri-send-plane-line mr-2"></i>
                        {buttonTrigger}
                      </>
                    )}
                  </button>

                  {/* Status Message */}
                  {result && (
                    <div className={`p-4 rounded-xl border ${
                      result.includes("Successfully") 
                        ? "bg-green-500/10 border-green-500/30 text-green-400" 
                        : result.includes("❌")
                        ? "bg-red-500/10 border-red-500/30 text-red-400"
                        : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                    }`}>
                      <div className="flex items-center gap-3">
                        <i className={`text-lg ${
                          result.includes("Successfully") ? "ri-check-circle-line" : 
                          result.includes("❌") ? "ri-error-warning-line" :
                          "ri-information-line"
                        }`}></i>
                        <span className="font-medium">{result}</span>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              
              {/* Contact Methods */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/30 shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                    <i className="ri-customer-service-line text-blue-400"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Get in Touch</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                      <i className="ri-mail-line text-blue-400"></i>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Email us at</p>
                      <p className="text-white font-medium">support@yourplatform.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                      <i className="ri-question-answer-line text-green-400"></i>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Join our community</p>
                      <p className="text-white font-medium">Q&A Section</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                      <i className="ri-time-line text-purple-400"></i>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Response time</p>
                      <p className="text-white font-medium">Within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/30 shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                    <i className="ri-question-line text-blue-400"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Quick Help</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">Common Questions</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li>• How do I access experiments?</li>
                      <li>• Can I contribute content?</li>
                      <li>• Is the platform free to use?</li>
                      <li>• How do I report an issue?</li>
                    </ul>
                  </div>
                  
                  <Link
                    href="/qa"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-300 text-sm font-medium"
                  >
                    <i className="ri-external-link-line"></i>
                    Visit Q&A for more help
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
