export default function AboutUsPage() {
  const teamMembers = [
    {
      name: "Sheyansh Verma",
      role: "Full-Stack Developer",
      image: "ri-code-s-slash-line",
      description: "Passionate developer creating meaningful digital experiences with clean code, scalable architecture, and modern design."
    },
    {
      name: "Pooja Lodhi",
      role: "Educational Specialist",
      image: "ri-book-open-line",
      description: "Expert in pharmaceutical sciences ensuring accurate and comprehensive content."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br lg:pt-25 from-slate-950 via-slate-900 py-8 to-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"></div>
      
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-6xl mx-auto">
          {/* Heart Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/60 rounded-full mb-8 border border-slate-700/30 shadow-2xl">
            <i className="ri-heart-pulse-line text-3xl text-red-400"></i>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-8 tracking-tight">
            About Us
          </h1>

          {/* Main Message */}
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/30 shadow-2xl p-3 py-8 lg:p-12 mb-12">
            <p className="text-2xl sm:text-4xl font-bold text-slate-300 leading-relaxed mb-6">
              Made with love, Aim to help   &hearts; 
            </p>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
              We&apos;re a passionate team dedicated to making pharmaceutical education accessible,
              engaging, and impactful for students and professionals worldwide.
            </p>
          </div>

          {/* Mission Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-heart-line text-xl text-red-400"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Made with Love</h3>
              <p className="text-slate-400 text-sm">Every feature is crafted with care and dedication to serve our community.</p>
            </div>

            <div className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-hand-heart-line text-xl text-blue-400"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Aim to Help</h3>
              <p className="text-slate-400 text-sm">Our purpose is to support your learning journey and academic success.</p>
            </div>

            <div className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-community-line text-xl text-green-400"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Building Community</h3>
              <p className="text-slate-400 text-sm">Creating connections and fostering collaboration in pharmaceutical education.</p>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">Meet Our Team</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {teamMembers.map((member, index) => (
                <div 
                  key={index}
                  className="bg-slate-800/60 rounded-xl border border-slate-700/30 shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full mb-6">
                      <i className={`${member.image} text-2xl text-blue-400`}></i>
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">{member.name}</h4>
                    <p className="text-blue-400 font-medium mb-4">{member.role}</p>
                    <p className="text-slate-400 leading-relaxed text-sm">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12">
            <p className="text-slate-500 text-sm">
              Empowering the next generation of pharmaceutical professionals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
