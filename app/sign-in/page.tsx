import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br  lg:pb-0 from-slate-950 via-slate-900 to-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
      
      {/* Content Container */}
      <div className="relative min-h-screen flex lg:justify-center lg:items-center px-4 py-6">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="text-center mb-4 lg:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/60 rounded-full mb-3 lg:mb-6 border border-slate-700/30 shadow-xl">
              <i className="ri-microscope-line text-2xl text-blue-400"></i>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-1 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sign in to access question & answers section
            </p>
          </div>

          {/* Sign In Component Container */}
          <div className="relative">
            
            {/* Main Container */}
            <div className="relative bg-slate-800/60 rounded-2xl border border-slate-700/30 shadow-2xl overflow-hidden">
              <div className="lg:p-6">
                <SignIn 
                  path="/sign-in" 
                  routing="path" 
                  signUpUrl="/sign-up"
                />
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="text-center mt-5 lg:mt-8">
            <div className="flex items-center justify-center space-x-4 text-slate-500 text-sm">
              <div className="flex items-center space-x-1">
                <i className="ri-shield-check-line text-green-400"></i>
                <span>Secure</span>
              </div>
              <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
              <div className="flex items-center space-x-1">
                <i className="ri-lock-line text-blue-400"></i>
                <span>Encrypted</span>
              </div>
              <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
              <div className="flex items-center space-x-1">
                <i className="ri-verified-badge-line text-purple-400"></i>
                <span>Trusted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/5 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/5 rounded-full blur-xl"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-green-500/5 rounded-full blur-xl"></div>
    </div>
  );
}
