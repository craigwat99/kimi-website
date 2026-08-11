import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Download, ExternalLink, Maximize2 } from 'lucide-react';
import { Navigation } from './Navigation';

const PDF_URL = '/40-years-commemorative-programme.pdf';

export function CommemorativeProgramme() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const handleNavigate = useCallback((sectionId: string) => {
    window.location.href = `/#${sectionId}`;
  }, []);

  // Inline PDF viewers are unreliable on phones and tablets, so offer
  // a direct open/download card there instead of an empty embed.
  useEffect(() => {
    const query = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsSmallScreen(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return (
    <div className="min-h-screen bg-[#784982]/5">
      <Navigation onNavigate={handleNavigate} />

      {/* Hero header */}
      <div className="relative bg-[#784982] text-white overflow-hidden pt-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase' }}
          >
            The Commemorative Programme
          </h1>
          <p className="text-lg text-white/85 max-w-2xl mx-auto">
            Read the keepsake programme marking 40 Years of Homosexual Law Reform in Aotearoa &mdash;
            the movement, the milestones and the people who made change happen.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={PDF_URL}
              download
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-[#784982] font-bold hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-xl shadow-black/20 rounded-lg"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </a>
            <a
              href={PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-white/70 text-white font-bold hover:bg-white/10 transition-all duration-300 rounded-lg"
            >
              <Maximize2 className="w-5 h-5" />
              Open in full screen
            </a>
          </div>
        </div>
      </div>

      {/* Reader */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {isSmallScreen ? (
          <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#784982]/10 mb-5">
              <BookOpen className="w-7 h-7 text-[#784982]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Read on your device</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Phones and tablets read the programme best in their own PDF viewer. Tap below to open
              it, or save a copy to keep.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={PDF_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#784982] text-white font-bold hover:bg-[#5a3562] transition-all duration-300 shadow-lg rounded-lg"
              >
                <ExternalLink className="w-5 h-5" />
                Open the programme
              </a>
              <a
                href={PDF_URL}
                download
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-[#784982] text-[#784982] font-bold hover:bg-[#784982]/5 transition-all duration-300 rounded-lg"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
            <object
              data={`${PDF_URL}#view=FitH`}
              type="application/pdf"
              className="w-full h-[80vh] min-h-[600px]"
              aria-label="40 Years of Homosexual Law Reform commemorative programme"
            >
              <div className="p-12 text-center">
                <p className="text-gray-600 text-lg mb-6">
                  Your browser can&rsquo;t display the programme inline.
                </p>
                <a
                  href={PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#784982] text-white font-bold hover:bg-[#5a3562] transition-colors rounded-lg"
                >
                  <ExternalLink className="w-5 h-5" />
                  Open the programme
                </a>
              </div>
            </object>
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-[#784982] font-semibold hover:text-[#5a3562] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
          <p className="text-gray-500 text-sm text-center sm:text-right">
            Prefer a printed copy? Pick one up from Wellington Central Library, or{' '}
            <a
              href="mailto:contact@40yearsoflove.nz?subject=Anniversary%20Booklet%20order"
              className="text-[#784982] font-semibold hover:underline"
            >
              email us to order
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
