import React from 'react';
import kabib from '../assets/Images/kabib.png'
import islam from '../assets/Images/islam.png'
import map from '../assets/Images/world.jpg'
import { useNavigate } from 'react-router-dom';

const Launch = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0B1A] text-white">
      {/* Navigation */}
      <nav className="container mx-auto flex items-center justify-between px-4 py-6">
        <a href="/" className="text-2xl font-bold text-white">
          <span className="font-mono">&lt;/&gt;</span>Snd
        </a>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-white hover:text-white/80"  onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="rounded-md bg-[#1C1D2D] px-4 py-2 text-white hover:bg-[#1C1D2D]/80" onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container relative px-4 pt-20 md:pt-8">
        <div className="relative">
          {/* Welcome Message */}
          <div className="mb-6 inline-block rounded-full bg-white/10 px-6 py-2 backdrop-blur-sm">
            <span className="text-white">👋 Welcome to Send</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6 px-10">
              <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl">
                Empower Your Growth
                <br />
                <span className="text-[#4D7EF2]">Link Skills<br></br> Time Exchange</span>
              </h1>
              <p className="text-xl text-gray-400">
                Create, Share, Collaborate, and Grow Together
              </p>
              <button className="rounded-md bg-[#4D7EF2] px-8 py-6 text-lg hover:bg-[#3D6AD8]" onClick={() => navigate('/home')}>
                Get Started
              </button>
            </div>
            <div className="relative">
            {/* <div className="relative h-[400px] w-10 overflow-hidden rounded-lg bg-[#1C1D2D]/50">
                <img
                  src={kabib}
                  alt="Hero collaboration"
                  className="h-full w-full object-cover"
                />
              </div> */}
              <div className="relative h-[400px] w-full">
                {/* First Testimonial */}
                <div className="absolute right-0 top-0 w-80 rounded-lg bg-[#1C1D2D] p-4">
                  <div className="flex items-start gap-4">
                    {/* <div className="h-12 w-12 rounded-full bg-[#4D7EF2]" /> */}
                    <img
                  src={kabib}
                  alt="Hero collaboration"
                  className="h-12 w-12 object-cover"
                />
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-white">Kabib Nurmagomedov</p>
                      <p className="text-sm text-gray-400">Any tips for async in Node.js?</p>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400' : 'fill-none'} text-yellow-400`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Second Testimonial */}
                <div className="absolute bottom-0 left-0 w-80 rounded-lg bg-[#1C1D2D] p-4">
                  <div className="flex items-start gap-4">
                    {/* <div className="h-12 w-12 rounded-full bg-[#4D7EF2]" /> */}
                    <img
                  src={islam}
                  alt="Hero collaboration"
                  className="h-12 w-12 object-cover"
                />
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-white">Islam Makhachev</p>
                      <p className="text-sm text-gray-400">Promises work well!</p>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute left-1/4 top-1/4 h-4 w-4 rotate-45 bg-[#4D7EF2]/30" />
          <div className="absolute right-1/3 top-1/2 h-3 w-3 rounded-full bg-purple-400/30" />
          <div className="absolute left-1/2 top-3/4 h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-yellow-400/30" />
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Our Features</h2>
        <div className="relative mx-auto max-w-3xl">
          <div className="aspect-square">
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#4D7EF2]">
              <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#4D7EF2]/50" />
            </div>
            {/* Orbital Items */}
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4D7EF2]"
                style={{
                  transform: `rotate(${i * 90}deg) translateX(120px)`,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Communication Section */}
      <section className="container px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Effortless Communication</h2>
            <p className="text-gray-400">
              Connect seamlessly with professionals worldwide. Our platform enables real-time
              collaboration and skill exchange through an intuitive interface.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-full border border-[#4D7EF2]/20" />
          </div>
        </div>
      </section>

      {/* Time Banking Section */}
      <section className="container px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <div className="flex justify-around">
              {['#4D7EF2', '#F24D4D', '#4DF24D'].map((color, i) => (
                <div
                  key={i}
                  className="h-16 w-16 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-6 lg:order-2">
            <h2 className="text-3xl font-bold">Time Banking Invest in Knowledge</h2>
            <p className="text-gray-400">
              Exchange your valuable time and skills with others. Our time banking system ensures
              fair and transparent skill exchange across the platform.
            </p>
          </div>
        </div>
      </section>

      {/* Global Collaboration Section */}
      <section className="container px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Global Collaboration Hub</h2>
        <div className="relative mx-auto max-w-4xl">
          <div className="aspect-[2/1] rounded-lg bg-[#1C1D2D]">
            {/* Connection Points */}
            <img
                src={map}
                alt="World map"
                className="h-full w-full object-cover opacity-4"
              />
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute h-3 w-3 rounded-full bg-[#4D7EF2]"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              >
                <div className="absolute -inset-1 animate-ping rounded-full bg-[#4D7EF2]/20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Launch;