import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Star, Users, Sparkles, Heart } from 'lucide-react';

function useReveal(threshold = 0.2) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

const matarikiStars = [
  { name: 'Matariki', meaning: 'The mother star — connected to health and wellbeing' },
  { name: 'Tupuānuku', meaning: 'Connected to food grown in the ground' },
  { name: 'Tupuārangi', meaning: 'Connected to food from the sky — birds and elevated gardens' },
  { name: 'Waipuna-ā-Rangi', meaning: 'Connected to the rain and freshwater' },
  { name: 'Waitī', meaning: 'Connected to freshwater bodies and the creatures within' },
  { name: 'Waitā', meaning: 'Connected to the ocean and its food sources' },
  { name: 'Ururangi', meaning: 'Connected to the winds' },
  { name: 'Pōhutukawa', meaning: 'Connected to those who have passed — the star of remembrance' },
  { name: 'Hiwa-i-te-Rangi', meaning: 'The wishing star — connected to aspirations for the year ahead' },
];

const fallbackNames = [
  'Alan Ottaway', 'Alan Seymour', 'Alexander Turnbull', 'Alexis Kennedy', 'Alice Mills',
  'Alison Laurie', 'Amanda Ashley', 'Amy Bock', 'Arthur Tauhore', 'Barry Neels',
  'Bea Arthur', 'Betty Armstrong', 'Bill Gosden', 'Billy Farnell', 'Brett Sheppard',
  'Brian Andrews', 'Brian Brake', 'Briar Bentley', 'Bruce Burnett', 'Bruce Mason',
  'Carmen Rupe', 'Cees Kooge', 'Charles Aberhart', 'Charles Brasch', 'Charles Mackay',
  'Charlie Haigh', 'Charlotte Loh', 'Cherie Hardie-Rippon', 'Chrissy Witoko', 'Christopher Small',
  'Claude Tanner', 'Cliff McIntyre', 'Cole Hampton', 'Dana de Milo', 'Dana DePaul',
  'Daniel Beech', 'Daniel Fielding', 'Darren Horn', 'Darren Taylor aka Bambi Slut',
  'David Carson-Parker', 'David Halls', 'David Lyndon Brown', 'David Malo', 'David McNee',
  'David Milne aka Dorabella', 'David Russell', 'Derek Elvy', 'Derek Jarman', 'Diksy Jones',
  'Donald Stenhouse', 'Dorothy Kate Richmond aka Dolla', 'Douglas Hughes', 'Douglas Lilburn',
  'Douglas MacDiarmid', 'Douglas Wright', 'Ed Manson', 'Effie Pollen', 'Emma Ada Scott',
  'Eric McCormick', 'Ernie Webber', 'Etipasi Daniells-Silva', 'Eve van Grafhorst', 'Felix Kelly',
  'Fergus Collinson', 'Fergus Dick', 'Frances Hodgkins', 'Frank Lund aka Toni Roget',
  'Frank Sargeson', 'Freda Stark', 'Gavin McLean', 'Geoffrey Busch Geertsema', 'Georgina Beyer',
  'Gerald Turnbull', 'Glyn Philpot', 'Godfrey Wilson', 'Grant Lingard', 'Hana Tatere Knight',
  'Harold Robinson', 'Hayden Miles', 'Heather McPherson', 'Henare te Ua', 'Henry Dennis',
  'Henry Harry Holland', 'Hjelmar von Dannevill', 'Ian Kember', 'Ian McMinn', 'Ian Smith',
  'Ihaia Gillman-Harris', 'Jack Body', 'Jack Goodwin', 'James Brownhill', 'James Courage',
  'Jan Smith', 'Jan Wilson', 'Jane Khull', 'Jeff Fowler', 'Jeff Whittington',
  'Jerome Vlietstra', 'Jim Robb', 'John Jakeman', 'John Kiddie', 'John Mansfield Thomson',
  'John Templer', 'Johnny Croskery', 'Jonathan Dennis', 'Jonathan Mane-Wheoki',
  'Katherine Mansfield', 'Keri Hulme', 'Kevin Baker', 'Kevin Todd', 'Larry Jenkins',
  'Lawrence Baigent', 'Lee Jensen', 'Leo Bensemann', 'Leonard Hollobon', 'Leslie Mack',
  'Lew Pryme', 'Lindsay Taylor', 'Maata Mahupuku', 'Mahinarangi Tocker', 'Malcolm Harrison',
  'Mama Tere Strickland', 'Manawaroa Te Wao', 'Marcus Craig', 'Margaret Nielsen', 'Martin Hunt',
  'Matt Whyte', 'Matt Wildbore', 'Matthew Soeberg', 'Meg Torwl', 'Merton Hodge',
  'Miles Radcliffe', 'Murray Hammington', 'Neil Costelloe', 'Neil Grange', 'Neville Creighton',
  'Ngaio Marsh', 'Nigel Baumber', 'Norman Gibson', 'Olive Te Oriwia Harding', 'Pat Rosier',
  'Paul Jenden', 'Paul Noble', 'Paul Perry', 'Peggy Dawson', 'Peter Cuthbert',
  'Peter Ellis', 'Peter Gordon', 'Peter Hudson', 'Peter Marshall', 'Peter Rule',
  'Peter Sinclair', 'Peter Sumner', 'Peter Taylor', 'Peter Wells', 'Phil Smees',
  'Philip Bailey', 'Phillip Cottrell', 'Porleen Simmonds', 'Prudence de Villiers', 'Rae Gilmour',
  'Ralph Knowles', 'Rangikawhiua Patrick Chadwick', 'Renee Taylor', 'Rewi Alley', 'Rex Mason',
  'Rex Nan Kivell', 'Rex Pilgrim', 'Robert Erwin', 'Robert Gant', 'Robert Lord',
  'Robert Mervyn', 'Robert Woolf', 'Robin Duff', 'Robin Henderson', 'Rod McLeod Morrison',
  'Roman Skorek', 'Ron Brownson', 'Ross Burden', 'Roy Ayling', 'Ruth Charters',
  'Seaward MacGregor', 'Shane Town', 'Sharon Alston', 'Shelley Te Waiariki Howard',
  'Sister Paula Brettkelly', "So'oalo To'oto'oali'i Roger Stanley", 'Stanley Waipouri',
  'Sue Dunlop', 'Susan Bartel', 'Suzi Fray', 'Takuwai Makiri-Mason', 'Thelma Trott',
  'Theo Schoon', 'Thomas Ongley', 'Tom McLean', "Tom O'Donoghue", 'Tony Mackle',
  'Toss Woollaston', 'Trevor Lawler', 'Trevor Morley', 'Ursula Bethell', 'Vanessa Wedding',
  'Venn Young', 'Vern Keller', 'Victor Taurewa Biddle', 'Virginia Burns aka Virginia Parker-Bowles',
  'Warren Butler', 'Warren Douglas', 'Wilfred Ford', 'William Leith', 'William Taylor',
  'William Yate', 'Wimoka Smith', 'Yoka Neuman', 'Zena Campbell',
];

export function RememberThem() {
  const hero = useReveal(0.1);
  const matarikiIntro = useReveal();
  const starsSection = useReveal(0.1);
  const connectionSection = useReveal();
  const tupunaIntro = useReveal();
  const tupunaBody = useReveal();
  const namesSection = useReveal(0.1);
  const closingSection = useReveal();

  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    fetch('/.netlify/functions/get-remembrance-names')
      .then(res => res.json())
      .then(data => {
        if (data.names && data.names.length > 0) {
          setNames(data.names.map((n: { name: string }) => n.name));
        } else {
          setNames(fallbackNames);
        }
      })
      .catch(() => {
        setNames(fallbackNames);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top navigation bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-lg py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <a
              href="/"
              className="flex items-center gap-2 text-[#784982] hover:text-[#784982]/80 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </a>
            <a href="/" className="font-bold text-xl text-[#784982]">
              <img src="/40TH.png" alt="" className="inline-block h-[1.6em] mr-1 align-middle relative -top-[0.05em]" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={hero.ref as React.RefObject<HTMLElement>}
        className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 40%, #784982 100%)' }}
      >
        {/* Star field */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
                animation: `float ${Math.random() * 8 + 8}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 transition-all duration-700 ${
              hero.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Star className="w-4 h-4 text-[#e5c858]" />
            <span className="text-white/90 text-sm font-medium tracking-wide">Matariki 2026</span>
          </div>

          <h1
            className={`text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 transition-all duration-1000 ${
              hero.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
            style={{ transitionDelay: '200ms', transitionTimingFunction: 'var(--ease-spring)' }}
          >
            Remember Them
          </h1>

          <div
            className={`w-24 h-1 mx-auto mb-8 rounded-full bg-[#e5c858] transition-all duration-700 ${
              hero.isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          />

          <p
            className={`text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed transition-all duration-700 ${
              hero.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            As the Matariki star cluster rises in the mid-winter sky, we pause to remember those
            who came before us — the tūpuna, the activists, and the loved ones whose courage
            made our celebration possible.
          </p>
        </div>
      </section>

      {/* Matariki Section */}
      <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#784982]/5 rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#e5c858]/5 rounded-full -translate-x-1/2 translate-y-1/2" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div
            ref={matarikiIntro.ref as React.RefObject<HTMLDivElement>}
            className="text-center mb-16"
          >
            <div
              className={`inline-flex items-center gap-2 text-[#784982] mb-4 transition-all duration-700 ${
                matarikiIntro.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-widest uppercase">Te Kāhui o Matariki</span>
            </div>

            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl leading-normal sm:leading-normal lg:leading-normal font-bold mb-8 transition-all duration-700 ${
                matarikiIntro.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <span className="gradient-text">Matariki</span>
            </h2>

            <div
              className={`w-24 h-1 mx-auto mb-10 rounded-full bg-[#784982] transition-all duration-700 ${
                matarikiIntro.isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
              }`}
              style={{ transitionDelay: '300ms' }}
            />

            <div className="space-y-6 text-lg sm:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              <p
                className={`transition-all duration-700 ${
                  matarikiIntro.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '400ms' }}
              >
                Matariki is the Māori New Year, marked by the rising of the <strong className="text-[#784982]">Matariki
                star cluster</strong> (known as the Pleiades) in the mid-winter sky. It is a time of
                reflection, remembrance, and renewal — a moment to honour those who have passed,
                to celebrate the present, and to set intentions for the year ahead.
              </p>

              <p
                className={`transition-all duration-700 ${
                  matarikiIntro.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '600ms' }}
              >
                In 2022, Aotearoa New Zealand became the first country in the world to recognise
                an indigenous celebration as a <strong className="text-[#784982]">national public holiday</strong>. Matariki is
                observed each year in late June or early July — the same time we gather to mark the
                anniversary of the Homosexual Law Reform Act.
              </p>
            </div>
          </div>

          {/* The Nine Stars */}
          <div ref={starsSection.ref as React.RefObject<HTMLDivElement>} className="mb-16">
            <h3
              className={`text-2xl sm:text-3xl font-bold text-center text-[#784982] mb-10 transition-all duration-700 ${
                starsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              The Nine Stars of Matariki
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matarikiStars.map((star, index) => (
                <div
                  key={star.name}
                  className={`group p-5 rounded-2xl border border-gray-100 hover:border-[#784982]/20 hover:shadow-xl bg-gray-50 transition-all duration-500 ${
                    starsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  } ${star.name === 'Pōhutukawa' ? 'sm:col-span-2 lg:col-span-1 ring-2 ring-[#784982]/20 bg-[#784982]/5' : ''}`}
                  style={{ transitionDelay: `${200 + index * 80}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <Star
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 transition-colors duration-300 ${
                        star.name === 'Pōhutukawa'
                          ? 'text-[#e5c858] fill-[#e5c858]'
                          : 'text-[#784982]/40 group-hover:text-[#e5c858] group-hover:fill-[#e5c858]'
                      }`}
                    />
                    <div>
                      <h4 className="font-bold text-[#784982] text-base mb-1">{star.name}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{star.meaning}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connection to events */}
          <div
            ref={connectionSection.ref as React.RefObject<HTMLDivElement>}
            className={`rounded-2xl p-8 sm:p-10 transition-all duration-700 ${
              connectionSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{
              background: 'linear-gradient(135deg, #784982 0%, #2d1b4e 100%)',
            }}
          >
            <div className="max-w-2xl mx-auto text-center">
              <Star className="w-8 h-8 text-[#e5c858] mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                Where Matariki Meets Our Kaupapa
              </h3>
              <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-4">
                The themes of Matariki mirror the heart of our 40th anniversary celebrations.
                Just as Matariki calls us to remember those who have gone before, we remember the
                activists and community members who fought for law reform. Just as Matariki
                celebrates the present, we celebrate 40 years of progress. And just as
                Hiwa-i-te-Rangi carries our hopes forward, we look toward a future of greater
                equity and inclusion.
              </p>
              <p className="text-white/70 text-sm italic">
                Matariki reminds us that looking back and looking forward are not opposites — they
                are part of the same journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Remembering our Tūpuna Section */}
      <section
        className="relative py-20 sm:py-28 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #f8f6f9 0%, #ffffff 100%)' }}
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#784982]/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-20 right-0 w-80 h-80 bg-[#e5c858]/5 rounded-full translate-x-1/3" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div
            ref={tupunaIntro.ref as React.RefObject<HTMLDivElement>}
            className="text-center mb-16"
          >
            <div
              className={`inline-flex items-center gap-2 text-[#784982] mb-4 transition-all duration-700 ${
                tupunaIntro.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-widest uppercase">Honouring Our Ancestors</span>
            </div>

            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl leading-normal sm:leading-normal lg:leading-normal font-bold mb-8 transition-all duration-700 ${
                tupunaIntro.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <span className="gradient-text">Remembering our Tūpuna</span>
            </h2>

            <div
              className={`w-24 h-1 mx-auto mb-10 rounded-full bg-[#784982] transition-all duration-700 ${
                tupunaIntro.isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
              }`}
              style={{ transitionDelay: '300ms' }}
            />
          </div>

          {/* Body content */}
          <div
            ref={tupunaBody.ref as React.RefObject<HTMLDivElement>}
            className="space-y-6 text-lg sm:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto"
          >
            <p
              className={`transition-all duration-700 ${
                tupunaBody.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              In te ao Māori, <strong className="text-[#784982]">tūpuna</strong> are the ancestors — those
              who walked before us and whose lives shaped the world we inherit. To remember our tūpuna is
              not simply to look backward; it is to honour the path they laid before us and carry their
              strength and dreams into the future.
            </p>

            <p
              className={`transition-all duration-700 ${
                tupunaBody.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              During Matariki, the star <strong className="text-[#784982]">Pōhutukawa</strong> connects us to
              those who have died since the last rising of the cluster. It is a time to speak their names,
              to share their stories, and to let our grief and gratitude sit alongside one another.
            </p>

            <p
              className={`transition-all duration-700 ${
                tupunaBody.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              As we mark 40 years since the Homosexual Law Reform Act, we hold space for the many people
              in our rainbow communities who did not live to see this milestone. We remember those
              who marched, who spoke out, who loved openly in the face of prejudice — and those who
              could not. We remember the lives lost to the AIDS epidemic, to violence, and to the
              deep harm of stigma and discrimination.
            </p>

            <p
              className={`transition-all duration-700 ${
                tupunaBody.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '600ms' }}
            >
              Their courage made our freedom possible. This celebration belongs to them as much as
              it belongs to us.
            </p>
          </div>

          {/* Memorial cards */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 transition-all duration-700 ${
              tupunaBody.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
            style={{ transitionDelay: '800ms' }}
          >
            {[
              {
                title: 'Those who fought',
                description: 'The activists and allies who campaigned tirelessly for law reform and equal rights.',
              },
              {
                title: 'Those we lost',
                description: 'Community members taken too soon — to illness, to violence, to a world that was not yet ready to accept them.',
              },
              {
                title: 'Those who loved',
                description: 'Every person who lived authentically, who built community, and who showed the world what courage looks like.',
              },
            ].map((card, index) => (
              <div
                key={card.title}
                className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-[#784982]/20 hover:shadow-xl transition-all duration-500"
                style={{ transitionDelay: `${900 + index * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-[#784982]/10 flex items-center justify-center mb-4 group-hover:bg-[#784982]/20 transition-colors">
                  <Star className="w-5 h-5 text-[#784982]" />
                </div>
                <h4 className="font-bold text-[#784982] text-lg mb-2">{card.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Those No Longer With Us */}
      <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#784982]/5 rounded-full -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#e5c858]/5 rounded-full translate-x-1/4 translate-y-1/4" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={namesSection.ref as React.RefObject<HTMLDivElement>}
            className="text-center mb-14"
          >
            <div
              className={`inline-flex items-center gap-2 text-[#784982] mb-4 transition-all duration-700 ${
                namesSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-widest uppercase">In Memoriam</span>
            </div>

            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl leading-normal sm:leading-normal lg:leading-normal font-bold mb-8 transition-all duration-700 ${
                namesSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <span className="gradient-text">Those No Longer With Us</span>
            </h2>

            <div
              className={`w-24 h-1 mx-auto mb-10 rounded-full bg-[#784982] transition-all duration-700 ${
                namesSection.isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
              }`}
              style={{ transitionDelay: '300ms' }}
            />

            <p
              className={`text-lg sm:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-14 transition-all duration-700 ${
                namesSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              We speak their names and hold their memory close. These are some of the
              community members who are no longer with us, but whose lives and contributions
              continue to shape who we are today.
            </p>
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 transition-all duration-700 ${
              namesSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            {names.map((name, index) => (
              <div
                key={name}
                className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#784982]/20 hover:bg-[#784982]/5 transition-all duration-300"
                style={{ transitionDelay: `${600 + index * 40}ms` }}
              >
                <Star className="w-3.5 h-3.5 text-[#e5c858] fill-[#e5c858] flex-shrink-0" />
                <span className="text-gray-800 font-medium">{name}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 text-center mt-10">
            Please contact us at{' '}
            <a href="mailto:contact@40yearsoflove.nz" className="text-[#784982] hover:underline">
              contact@40yearsoflove.nz
            </a>{' '}
            to have other names added.
          </p>
        </div>
      </section>

      {/* Closing / Call to Action */}
      <section
        ref={closingSection.ref as React.RefObject<HTMLElement>}
        className="relative py-20 sm:py-24 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #784982 100%)' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
                animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className={`text-xl sm:text-2xl text-white/90 leading-relaxed mb-8 italic transition-all duration-700 ${
              closingSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            "Ka mua, ka muri — walking backwards into the future."
          </p>
          <p
            className={`text-base sm:text-lg text-white/70 leading-relaxed mb-10 transition-all duration-700 ${
              closingSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            This whakataukī (proverb) reminds us that we move into the future guided by
            the past. As the stars of Matariki rise, may we carry the memory of our tūpuna
            with us — and honour their legacy by continuing the work of love, justice, and belonging.
          </p>
          <div
            className={`flex flex-wrap justify-center gap-4 transition-all duration-700 ${
              closingSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <a href="/#events" className="btn-primary">
              Explore Events
            </a>
            <a href="/letters-of-love" className="btn-secondary" style={{ color: 'white', borderColor: 'white' }}>
              Write a Letter of Love
            </a>
          </div>
        </div>
      </section>

      {/* Simple footer */}
      <footer className="bg-[#784982] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <a href="/" className="font-bold text-xl">
              <img src="/40Ytxt.png" alt="" className="inline-block h-[2em] align-middle" />
            </a>
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} 40 Years - Homosexual Law Reform. All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
