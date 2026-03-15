import { Heart, ArrowRight, PenLine, Video } from 'lucide-react';

export function LettersOfLovePromo() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3D1C5E] via-[#5A2E88] to-[#E91E8C]" />
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
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-6">
          <Heart className="w-8 h-8 text-white fill-current" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
          Letters of Love
        </h2>

        <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-3">
          Homosexual law reform was born from a movement of love &mdash; the right to love who you choose.
        </p>

        <p className="text-white/70 max-w-xl mx-auto mb-10">
          Share a letter to yourself, to someone who has passed, to your future self, or to someone special.
          Your words may become part of a time capsule at the National Gala Event.
        </p>

        {/* Feature cards */}
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

        {/* CTA */}
        <a
          href="/letters-of-love"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#5A2E88] font-bold text-lg hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-xl shadow-black/20"
        >
          Share Your Love
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
}
