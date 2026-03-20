import { useEffect, useRef, useState } from 'react';
import type { TimelineEvent } from '../types';
import { defaultTimelineEvents } from '../data/defaultTimeline';

export function HistoryTimeline() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(defaultTimelineEvents);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await fetch('/.netlify/functions/get-timeline');
        const data = await res.json();
        if (data.timeline && Array.isArray(data.timeline) && data.timeline.length > 0) {
          setTimelineEvents(data.timeline);
        }
        // If server returns no data, keep the defaults already in state
      } catch {
        // On error, keep the defaults already in state
      }
    };
    fetchTimeline();
  }, []);

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
      className="relative py-24 sm:py-32 bg-gray-50 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#784982] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#e5c858] rounded-full blur-3xl" />
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
          <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-1 bg-[#784982] rounded-full -translate-x-1/2" />

          {/* Events */}
          <div className="space-y-12">
            {timelineEvents.map((event, index) => {
              const isLeft = index % 2 === 0;
              const isActive = activeIndex === index;
              
              return (
                <div
                  key={event.id}
                  className={`relative flex items-start gap-8 transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {/* Year marker - mobile left, desktop alternating */}
                  <div className={`absolute left-5 md:left-1/2 -translate-x-1/2 z-10 ${
                    isActive ? 'scale-125' : ''
                  } transition-transform duration-300`}>
                    <div className={`w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
                      event.category === 'reform'
                        ? 'bg-[#e5c858]'
                        : 'bg-[#784982]'
                    }`}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`ml-16 md:ml-0 md:w-5/12 ${
                    isLeft ? 'md:mr-auto md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'
                  }`}>
                    <div className={`group p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 ${
                      isActive ? 'scale-105 border-[#784982]/20' : ''
                    }`}>
                      {/* Year */}
                      <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-3 ${
                        event.category === 'reform'
                          ? 'bg-[#e5c858] text-white'
                          : 'bg-gray-100 text-[#784982]'
                      }`}>
                        {event.year}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#784982] transition-colors">
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

        {/* Quiz call to action */}
        <div
          className={`mt-12 text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
          style={{ transitionDelay: '1700ms' }}
        >
          <div className="bg-[#784982]/5 rounded-2xl p-8 sm:p-10 border border-[#784982]/10">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Are you ready to test your knowledge?
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Think you know the history of homosexual law reform in New Zealand? Take our quiz and find out!
            </p>
            <a
              href="/quiz"
              className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
            >
              Take the Quiz
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
