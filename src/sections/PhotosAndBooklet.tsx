import { useEffect, useRef, useState } from 'react';
import { Camera, Facebook, ArrowRight, BookOpen, MapPin, Mail } from 'lucide-react';

const photoEvents = [
  'National Gala',
  'Governor General Afternoon Tea',
  'Rally',
];

export function PhotosAndBooklet() {
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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="photos-booklet"
      className="relative py-24 sm:py-32 bg-[#784982]/5 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl leading-normal sm:leading-normal lg:leading-normal font-bold mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <span className="gradient-text">Relive the Celebrations</span>
          </h2>
          <p
            className={`text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            Catch up on the photos and take home a keepsake from 40 years of Homosexual Law Reform.
          </p>
        </div>

        {/* Facebook photos banner */}
        <div
          className={`relative overflow-hidden rounded-3xl bg-[#784982] text-white shadow-xl shadow-[#784982]/20 mb-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '150ms' }}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm mb-5">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase' }}>
                Photos from the celebrations
              </h3>
              <p className="text-white/85 text-lg max-w-xl mx-auto lg:mx-0 mb-6">
                Photos from the <strong>National Gala</strong>, the{' '}
                <strong>Governor General&rsquo;s Afternoon Tea</strong> and the{' '}
                <strong>Rally</strong> are all up on our Facebook page. Head over to browse,
                tag yourself and share the memories.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
                {photoEvents.map((event) => (
                  <span
                    key={event}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-sm font-medium"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    {event}
                  </span>
                ))}
              </div>

              <a
                href="https://facebook.com/40yearsoflove"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#784982] font-bold hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-xl shadow-black/20 rounded-lg"
              >
                <Facebook className="w-5 h-5" />
                View Photos on Facebook
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Anniversary booklet promo */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8 sm:p-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '250ms' }}
        >
          {/* Image */}
          <div className="relative flex justify-center order-1 lg:order-none">
            <div className="absolute inset-0 bg-[#f089b7]/20 rounded-full blur-3xl scale-90" />
            <img
              src="/anniversary-booklet.png"
              alt="Stack of the 40 Years of Homosexual Law Reform commemorative booklets"
              className="relative w-full max-w-md object-contain drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]"
            />
          </div>

          {/* Text */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#784982]/10 mb-5">
              <BookOpen className="w-7 h-7 text-[#784982]" />
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase' }}>
              The Anniversary Booklet
            </h3>
            <p className="text-[#784982] font-semibold mb-4">
              Commemorative Programme &mdash; 40 Years of Homosexual Law Reform
            </p>
            <p className="text-gray-600 text-lg mb-8">
              A keepsake commemorative programme marking four decades of Homosexual Law Reform in
              Aotearoa. Grab a copy to remember the movement, the milestones and the people who
              made change happen.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 text-left">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-[#784982]/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#784982]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Pick one up in person</p>
                  <p className="text-gray-600">
                    Copies are available to collect from <strong>Wellington Central Library</strong>.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 text-left">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-[#784982]/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#784982]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Order copies by email</p>
                  <p className="text-gray-600">
                    Prefer copies sent to you? Email us to order &mdash; postage will apply.
                  </p>
                </div>
              </div>
            </div>

            <a
              href="mailto:contact@40yearsoflove.nz?subject=Anniversary%20Booklet%20order"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#784982] text-white font-bold hover:bg-[#5a3562] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl rounded-lg"
            >
              <Mail className="w-5 h-5" />
              Email us to order copies
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
