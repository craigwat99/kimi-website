import { useEffect, useState } from 'react';
import { Heart, PenLine, Video, ArrowRight } from 'lucide-react';

const letterTypeLabels: Record<string, string> = {
  'to-myself': 'A letter to myself',
  'to-passed': 'To someone who has passed',
  'to-future-self': 'To my future self',
  'to-someone-special': 'To someone special',
};

interface ApprovedLetter {
  id: string;
  authorName: string;
  letterType: string;
  message: string;
  imageKey: string | null;
  createdAt: string;
}

export function LettersOfLovePromo() {
  const [letters, setLetters] = useState<ApprovedLetter[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/.netlify/functions/get-approved-letters');
        if (res.ok) {
          const data = await res.json();
          setLetters(data.letters || []);
        }
      } catch (err) {
        console.error('Failed to fetch approved letters:', err);
      }
    })();
  }, []);

  // Duplicate list for seamless loop
  const scrollingLetters = letters.length > 0 ? [...letters, ...letters] : [];

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[#784982]" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-56 h-56 bg-white rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-3xl opacity-50" />
      </div>

      {/* Floating hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-[float_6s_ease-in-out_infinite]"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`,
              opacity: 0.15,
            }}
          >
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-6">
          <Heart className="w-8 h-8 text-white fill-current" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-normal sm:leading-normal lg:leading-normal font-black text-white mb-4">
          Letters of Love
        </h2>

        <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-3">
          Homosexual law reform was born from a movement of love &mdash; the right to love who you
          choose.
        </p>

        <p className="text-white/70 max-w-xl mx-auto mb-10">
          Share a letter to yourself, to someone who has passed, to your future self, or to someone
          special. Your words may become part of a time capsule at the National Gala Event.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-10">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 text-left">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <PenLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Write a Letter</p>
              <p className="text-white/60 text-xs">Pour your heart out in words</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 text-left">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Record a Video</p>
              <p className="text-white/60 text-xs">Say it with your voice</p>
            </div>
          </div>
        </div>

        <a
          href="/letters-of-love"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#784982] font-bold text-lg hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-xl shadow-black/20"
        >
          Share Your Love
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>

      {/* Scrolling letters marquee */}
      {scrollingLetters.length > 0 && (
        <div
          className="relative mt-14 overflow-hidden"
          style={{
            maskImage:
              'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          }}
        >
          <div
            className="flex gap-6 w-max animate-[marquee_60s_linear_infinite] hover:[animation-play-state:paused]"
          >
            {scrollingLetters.map((letter, i) => (
              <a
                key={`${letter.id}-${i}`}
                href="/letters-of-love"
                className="shrink-0 w-72 sm:w-80 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-left hover:bg-white/15 hover:border-white/30 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white fill-current" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm truncate">
                      {letter.authorName}
                    </p>
                    <p className="text-xs text-[#e5c858]">
                      {letterTypeLabels[letter.letterType] || 'A letter of love'}
                    </p>
                  </div>
                </div>
                <p className="text-white/80 text-sm leading-relaxed line-clamp-4">
                  {letter.message}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
