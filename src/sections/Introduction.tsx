import { useEffect, useRef, useState } from 'react';

export function Introduction() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 bg-white overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#784982]/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#e5c858]/5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl leading-normal sm:leading-normal lg:leading-normal font-bold mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <span className="gradient-text">A Celebration of Progress</span>
        </h2>

        {/* Decorative line */}
        <div
          className={`w-24 h-1 mx-auto mb-10 rounded-full bg-[#784982] transition-all duration-700 ${
            isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`}
          style={{ transitionDelay: '200ms' }}
        />

        {/* logo */}
          <div
            className={`flex items-center justify-center transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
            style={{
              transitionDelay: '600ms',
              transitionTimingFunction: 'var(--ease-spring)',
            }}
          >
            <img
              src="/40Y_HLR_LOGO_V1.png"
              alt="40 Years of Homosexual Law Reform logo"
              className="w-auto rounded-none shadow-none"
            />
          </div>

        {/* Body text */}
        <div className="space-y-6 text-lg sm:text-xl text-gray-700 leading-relaxed">
          <p
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            Forty years ago, New Zealand took a historic step toward equality. 
            The <strong className="text-[#784982]">Homosexual Law Reform Act of 1986</strong> decriminalised 
            consensual sexual acts between men, marking a pivotal moment in our nation's 
            journey toward human rights and acceptance.
          </p>

          <p
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            This July, we come together to honour the activists, the allies, and the 
            community who fought for change, and to celebrate how far we've come <strong className="text-[#784982]">while 
            looking toward the future.</strong>
          </p>
        </div>

        {/* Stats */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
          style={{ transitionDelay: '700ms' }}
        >
          {[
            { number: '1986', label: 'Year of Reform' },
            { number: '49-44', label: 'Parliamentary Vote' },
            { number: '40', label: 'Years of Progress' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="group p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#784982]/20 hover:shadow-xl transition-all duration-500"
              style={{ transitionDelay: `${800 + index * 100}ms` }}
            >
              <div className="text-4xl sm:text-5xl font-black gradient-text mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
