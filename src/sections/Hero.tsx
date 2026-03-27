import {useRef, useState } from 'react';

export function Hero() {
  const [isVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);


  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen w-full overflow-hidden flex items-center"
      style={{
        background: '#e5c858',
      }}
    >
      {/* Animated background overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'rgba(120,73,130,0.08)',
        }}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#784982]/20"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 8 + 8}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-[#784982] space-y-6">
            {/* Celebrating text */}
            <div 
              className={`overflow-hidden transition-all duration-600 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: '200ms' }}
            >
              <span className="inline-block text-lg sm:text-xl font-medium tracking-[0.3em] uppercase">
                {'CELEBRATING'.split('').map((letter, i) => (
                  <span
                    key={i}
                    className="inline-block"
                    style={{
                      animation: isVisible ? `fadeInUp 0.6s var(--ease-expo-out) ${200 + i * 50}ms forwards` : 'none',
                      opacity: 0,
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            </div>

            {/* 40 YEARS */}
            <div className="space-y-2">
              <h1 
                className={`text-7xl sm:text-8xl lg:text-9xl font-black leading-none tracking-tighter transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                style={{ 
                  transitionDelay: '600ms',
                  transitionTimingFunction: 'var(--ease-spring)',
                }}
              >
                4O
              </h1>
              <h2 
                className={`text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                style={{ 
                  transitionDelay: '800ms',
                  transitionTimingFunction: 'var(--ease-expo-out)',
                }}
              >
                YEARS
              </h2>
            </div>

            {/* Homosexual Law Reform */}
            <div className="space-y-1">
              <h3 
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide transition-all duration-600 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24'}`}
                style={{ 
                  transitionDelay: '1000ms',
                  transitionTimingFunction: 'var(--ease-expo-out)',
                }}
              >
                HOMOSEXUAL
              </h3>
              <h3 
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide transition-all duration-600 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24'}`}
                style={{ 
                  transitionDelay: '1200ms',
                  transitionTimingFunction: 'var(--ease-expo-out)',
                }}
              >
                LAW REFORM
              </h3>
            </div>

            {/* Date badge */}
            <div
              className={`inline-flex items-center gap-3 px-6 py-3 bg-[#784982]/10 backdrop-blur-sm border border-[#784982]/20 transition-all duration-800 ${isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-180'}`}
              style={{
                transitionDelay: '1400ms',
                transitionTimingFunction: 'var(--ease-elastic)',
              }}
            >
              <div className="w-2 h-2 bg-[#784982] rounded-full animate-pulse" />
              <span className="text-lg font-semibold tracking-wider">JULY 2026</span>
            </div>

            {/* Supporting text */}
            <p 
              className={`text-lg sm:text-xl text-[#784982]/90 max-w-lg leading-relaxed transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ 
                transitionDelay: '1600ms',
                transitionTimingFunction: 'var(--ease-expo-out)',
              }}
            >
              Celebrating the past, while looking to the future.
            </p>

            {/* CTA Buttons */}
            <div 
              className={`flex flex-wrap gap-4 pt-4 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ 
                transitionDelay: '1800ms',
                transitionTimingFunction: 'var(--ease-expo-out)',
              }}
            >
              <a 
                href="#events" 
                className="btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Events
              </a>
              <a 
                href="#history" 
                className="btn-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn the History
              </a>
            </div>
          </div>

          {/* Right content - Logo mark */}
          {/* 40 YEARS */}
            <div className="space-y-2">
              <h1 
                className={`text-7xl sm:text-8xl lg:text-9xl leading-none tracking-tighter transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                style={{ 
                  transitionDelay: '600ms',
                  transitionTimingFunction: 'var(--ease-spring)',
                }}
              >
                4O YEARS
              </h1>
             <h1 
                className={`text-7xl sm:text-8xl lg:text-9xl leading-none tracking-tighter transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                style={{ 
                  transitionDelay: '600ms',
                  transitionTimingFunction: 'var(--ease-spring)',
                }}
              >
               HOMOSEXUAL
              </h1>
              <h1 
                className={`text-7xl sm:text-8xl lg:text-9xl leading-none tracking-tighter transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                style={{ 
                  transitionDelay: '600ms',
                  transitionTimingFunction: 'var(--ease-spring)',
                }}
              >
                LAW
              </h1>
              <h1 
                className={`text-7xl sm:text-8xl lg:text-9xl leading-none tracking-tighter transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                style={{ 
                  transitionDelay: '600ms',
                  transitionTimingFunction: 'var(--ease-spring)',
                }}
              >
                REFORM
              </h1>
            </div>
        </div>
      </div>
    </section>
  );
}
