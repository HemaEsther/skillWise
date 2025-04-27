import { useState, useEffect } from 'react';

export default function FuturisticUI() {
  const [activeSection, setActiveSection] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
    const timer = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { 
      id: 0, 
      title: "Immersive Learning", 
      description: "Dive into interactive courses with cutting-edge visualization technology",
      color: "from-indigo-500 to-blue-500"
    },
    { 
      id: 1, 
      title: "AI Mentorship", 
      description: "Personalized guidance powered by advanced learning algorithms",
      color: "from-purple-500 to-pink-500"
    },
    { 
      id: 2, 
      title: "Global Community", 
      description: "Connect with learners and thought leaders worldwide",
      color: "from-emerald-500 to-teal-500"
    },
    { 
      id: 3, 
      title: "Future-Ready Skills", 
      description: "Master the competencies that shape tomorrow",
      color: "from-amber-500 to-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navigation */}
      {/* <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className={`h-4 w-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 ${isLoaded ? 'animate-pulse' : ''}`}></div>
            <span className="font-bold text-xl tracking-tight">NOVA</span>
          </div>
          
          <div className="hidden md:flex space-x-8">
            {['Experience', 'Technology', 'Community', 'About'].map((item, i) => (
              <button 
                key={i}
                className="relative text-sm uppercase tracking-widest hover:text-blue-400 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
          
          <button className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/20 text-sm font-medium tracking-wider">
            Begin Journey
          </button>
        </div>
      </nav> */}
      
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className={`absolute inset-0 bg-gradient-radial from-blue-500/20 to-transparent transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
        
        {/* Central Element */}
        <div className="relative z-10 text-center max-w-4xl px-6 transition-all duration-1000 transform translate-y-0">
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0 -translate-y-10'}`}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              The Future of Learning
            </span>
          </h1>
          
          <p className={`text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto transition-all delay-300 duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            A revolutionary platform where innovation meets education, designed for the minds of tomorrow.
          </p>
          
          <div className={`flex flex-wrap justify-center gap-4 transition-all delay-500 duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <button className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 text-white font-medium tracking-wide">
              Explore Interface
            </button>
            <button className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all backdrop-blur-sm text-white font-medium tracking-wide">
              Learn More
            </button>
          </div>
        </div>
        
        {/* Orbital Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl animate-float"></div>
          <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 blur-3xl animate-float-slow"></div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Feature Cards */}
            <div className="space-y-6">
              {features.map((feature) => (
                <div 
                  key={feature.id} 
                  className={`p-6 rounded-xl transition-all duration-500 backdrop-blur-sm border border-white/10 ${activeSection === feature.id ? 'bg-white/10 shadow-lg scale-105' : 'bg-white/5 hover:bg-white/10'}`}
                  onClick={() => setActiveSection(feature.id)}
                >
                  <div className="flex items-start">
                    <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <div className="h-3 w-3 bg-white rounded-full"></div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Visualization */}
            <div className="relative h-96 rounded-2xl overflow-hidden bg-black/50 backdrop-blur-sm border border-white/10">
              {features.map((feature) => (
                <div 
                  key={feature.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${activeSection === feature.id ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`h-32 w-32 rounded-full bg-gradient-to-br ${feature.color} animate-pulse-slow opacity-60 blur-2xl`}></div>
                    <div className={`absolute h-16 w-16 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                      <div className="h-4 w-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 text-center">
                    <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-300">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
            <span className="font-bold text-lg">NOVA</span>
          </div>
          
          <div className="flex space-x-6">
            {['Terms', 'Privacy', 'Support', 'Contact'].map((item, i) => (
              <button key={i} className="text-sm text-gray-400 hover:text-white transition-colors">
                {item}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}