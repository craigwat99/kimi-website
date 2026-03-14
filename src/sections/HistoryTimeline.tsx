import { useEffect, useRef, useState } from 'react';
import type { TimelineEvent } from '../types';

const timelineEvents: TimelineEvent[] = [
  {
    year: 1840,
    title: 'Te Tiriti o Waitangi',
    description: 'English law introduced to New Zealand, including the death penalty for sodomy. This criminalisation sharply contrasted with pre-colonial Māori society which embraced diverse sexualities and genders.',
    category: 'before',
  },
  {
    year: 1893,
    title: 'Criminal Code Act',
    description: 'New Zealand\'s Criminal Code Act explicitly outlawed male homosexual activity. Even consensual acts between men were deemed indecent assault, punishable by life imprisonment, hard labour, or corporal punishment.',
    category: 'before',
  },
  {
    year: 1963,
    title: 'Dorian Society',
    description: 'The Legal Subcommittee of the Dorian Society, a club for homosexual men in Wellington, initiated formal organising that led to setting up the NZ Homosexual Law Reform Society.',
    category: 'before',
  },
  {
    year: 1979,
    title: 'Warren Freer\'s Attempt',
    description: 'Labour MP Warren Freer attempted to introduce a private member\'s bill to legalise homosexual acts but withdrew due to divisive opposition within the community about the age of consent.',
    category: 'before',
  },
  {
    year: 1984,
    title: 'Gay Task Force Forms',
    description: 'Wellington Gay Task Force formed to support homosexual law reform, followed by groups in Christchurch and Auckland. The Coalition to Support the Bill united diverse groups.',
    category: 'before',
  },
  {
    year: 1985,
    title: 'Fran Wilde\'s Bill Introduced',
    description: 'Labour MP Fran Wilde introduced the Homosexual Law Reform Bill to Parliament. The bill aimed to decriminalise consensual homosexual activity between men aged 16 and over.',
    image: '/history-celebration.jpg',
    category: 'reform',
  },
  {
    year: 1985,
    title: 'The Petition',
    description: 'Opponents presented a petition claiming 800,000 signatures (later found to contain irregularities). On September 24, 91 boxes were delivered to Parliament in a controversial ceremony.',
    category: 'reform',
  },
  {
    year: 1986,
    title: 'The Vote - July 9',
    description: 'Part 1 of the Homosexual Law Reform Bill passed by a narrow margin of 49 votes to 44. The age of consent was set at 16, equal to heterosexual acts.',
    category: 'reform',
  },
  {
    year: 1986,
    title: 'Act Comes Into Effect - August 8',
    description: 'The Homosexual Law Reform Act came into effect, decriminalising consensual sexual acts between men aged 16 and over. For the first time, gay men could enter relationships without fear of prosecution.',
    category: 'reform',
  },
  {
    year: 1993,
    title: 'Human Rights Act',
    description: 'The Human Rights Act finally made it illegal to discriminate on the grounds of sexual orientation in employment, accommodation, and services. Part 2 of Fran Wilde\'s original bill was achieved.',
    category: 'after',
  },
  {
    year: 2004,
    title: 'Civil Unions Act',
    description: 'The Civil Union Act allowed same-sex couples to formalise their relationships with legal recognition, providing similar entitlements to marriage.',
    category: 'after',
  },
  {
    year: 2013,
    title: 'Marriage Equality',
    description: 'New Zealand became the 13th country in the world—and the first in the Asia-Pacific region—to legalise same-sex marriage with the Marriage (Definition of Marriage) Amendment Act.',
    category: 'after',
  },
];

export function HistoryTimeline() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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
      id="history"
      className="relative py-24 sm:py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#5A2E88] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#E91E8C] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <span className="gradient-text">The Journey to Reform</span>
          </h2>
          <p
            className={`text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            From criminalisation to decriminalisation: the decades-long fight for equality
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#5A2E88] via-[#7B4FA2] to-[#E91E8C] rounded-full transform md:-translate-x-1/2" />

          {/* Events */}
          <div className="space-y-12">
            {timelineEvents.map((event, index) => {
              const isLeft = index % 2 === 0;
              const isActive = activeIndex === index;
              
              return (
                <div
                  key={event.year}
                  className={`relative flex items-start gap-8 transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {/* Year marker - mobile left, desktop alternating */}
                  <div className={`absolute left-4 md:left-1/2 transform md:-translate-x-1/2 z-10 ${
                    isActive ? 'scale-125' : ''
                  } transition-transform duration-300`}>
                    <div className={`w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
                      event.category === 'reform'
                        ? 'bg-gradient-to-br from-[#E91E8C] to-[#5A2E88]'
                        : 'bg-gradient-to-br from-[#5A2E88] to-[#7B4FA2]'
                    }`}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`ml-16 md:ml-0 md:w-5/12 ${
                    isLeft ? 'md:mr-auto md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'
                  }`}>
                    <div className={`group p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 ${
                      isActive ? 'scale-105 border-[#5A2E88]/20' : ''
                    }`}>
                      {/* Year */}
                      <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-3 ${
                        event.category === 'reform'
                          ? 'bg-gradient-to-r from-[#E91E8C] to-[#5A2E88] text-white'
                          : 'bg-gray-100 text-[#5A2E88]'
                      }`}>
                        {event.year}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#5A2E88] transition-colors">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 leading-relaxed">
                        {event.description}
                      </p>

                      {/* Image if available */}
                      {event.image && (
                        <div className="mt-4 rounded-xl overflow-hidden">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to action */}
       <div
          className={`mt-16 text-center transition-all duration-700 flex flex-col items-center ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: '1500ms' }}
    >
      {/* This text stays at the top because it's the first item in the column */}
      <p className="text-gray-600 mb-6">
        Learn more about this important chapter in New Zealand's history
      </p>

      {/* This inner div groups the buttons so THEY sit side-by-side */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <a
          href="https://nzhistory.govt.nz/page/homosexual-law-reform-new-zealand"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex"
        >
          Read More on NZ History
        </a>
        <a
          href="https://www.pridenz.com/time/homosexual_law_reform.html"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex"
        >
          Check out the history at Pride NZ
        </a>
      </div>
    </div>
      </div>
    </section>
  );
}
