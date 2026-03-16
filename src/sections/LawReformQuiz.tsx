import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Navigation } from './Navigation';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const questions: Question[] = [
  {
    question: 'In what year was the Homosexual Law Reform Bill introduced to New Zealand Parliament?',
    options: ['1981', '1985', '1986', '1993'],
    correctIndex: 1,
    explanation:
      'The Homosexual Law Reform Bill was introduced on 8 March 1985 by Labour MP Fran Wilde as a private member\'s bill.',
  },
  {
    question: 'Who introduced the Homosexual Law Reform Bill to Parliament?',
    options: ['Helen Clark', 'Fran Wilde', 'Trevor Mallard', 'David Lange'],
    correctIndex: 1,
    explanation:
      'Fran Wilde, a Labour MP, introduced the bill. She faced significant personal backlash, including threatening phone calls and letters.',
  },
  {
    question: 'What was the maximum penalty for male homosexual activity under the Crimes Act 1961?',
    options: ['Life imprisonment', '14 years imprisonment', '7 years imprisonment', '5 years imprisonment'],
    correctIndex: 2,
    explanation:
      'The Crimes Act 1961 reduced the penalty from life imprisonment (under the 1893 Criminal Code Act) to a maximum of 7 years.',
  },
  {
    question: 'What was the name of New Zealand\'s first documented homosexual organisation, formed in 1962?',
    options: ['Gay Liberation Front', 'The Dorian Society', 'National Gay Rights Coalition', 'Sisters for Homophile Equality'],
    correctIndex: 1,
    explanation:
      'The Dorian Society was established on 27 May 1962 by 16 men in Wellington. It was New Zealand\'s first known homosexual organisation.',
  },
  {
    question: 'By what margin did the Homosexual Law Reform Bill pass its final (third) reading in 1986?',
    options: ['49 to 44', '55 to 38', '47 to 32', '60 to 30'],
    correctIndex: 0,
    explanation:
      'The bill passed its third reading on 9 July 1986 by a narrow margin of 49 votes to 44.',
  },
  {
    question: 'What was notable about the petition against the Homosexual Law Reform Bill presented by the Coalition of Concerned Citizens?',
    options: [
      'It was the largest petition in NZ history at the time',
      'It contained forged names including "Adolf Hitler" and "Yogi Bear"',
      'It was signed by every member of Parliament',
      'It was presented by the Prime Minister',
    ],
    correctIndex: 1,
    explanation:
      'The petition claimed around 800,000 signatures, but analysis revealed that 61% were not on the electoral roll, and dubious entries included fake names like "Adolf Hitler," "Yogi Bear," and "B. Bardot."',
  },
  {
    question: 'What age of consent was set for homosexual activity when the law was reformed?',
    options: ['18', '20', '16', '21'],
    correctIndex: 2,
    explanation:
      'The age of consent was set at 16, the same as the heterosexual age of consent. This was voted on 26 March 1986, passing 41 to 36.',
  },
  {
    question: 'What happened to Part 2 of the Homosexual Law Reform Bill, which proposed anti-discrimination protections?',
    options: [
      'It passed alongside Part 1',
      'It was defeated 49 to 31',
      'It was withdrawn before the vote',
      'It was deferred to the following year',
    ],
    correctIndex: 1,
    explanation:
      'Part 2, which would have banned discrimination based on sexual orientation in employment, accommodation, and services, was defeated 49 to 31 on 16 April 1986.',
  },
  {
    question: 'In what year did the Human Rights Act finally prohibit discrimination based on sexual orientation in New Zealand?',
    options: ['1986', '1990', '1993', '2000'],
    correctIndex: 2,
    explanation:
      'The Human Rights Act 1993 explicitly prohibited discrimination based on sexual orientation, filling the gap left when Part 2 of the 1986 bill was defeated.',
  },
  {
    question: 'Who was the Auckland university student barred from entering the United States in 1972 for being a lesbian, sparking the formation of the Gay Liberation Front in NZ?',
    options: ['Carmen Rupe', 'Ngahuia Te Awekotuku', 'Marilyn Waring', 'Joan Bellingham'],
    correctIndex: 1,
    explanation:
      'Ngahuia Te Awekotuku, an Auckland student, was refused a US visa on 15 March 1972 because she was a lesbian. This sparked the formation of the Gay Liberation Front, which held its first street protest on 11 April 1972.',
  },
  {
    question: 'What was the Criminal Code Act 1893\'s punishment for male homosexual activity?',
    options: [
      'A fine of 100 pounds',
      'Up to 7 years imprisonment',
      'Life imprisonment or corporal punishment',
      'Community service',
    ],
    correctIndex: 2,
    explanation:
      'The Criminal Code Act of 6 October 1893 explicitly outlawed male homosexual activity, with penalties including life imprisonment or corporal punishment.',
  },
  {
    question: 'What was the name of the support group formed by heterosexual allies, with its first chapter in Auckland in 1985?',
    options: [
      'Coalition to Support the Bill',
      'Campaign for Tolerance',
      'Rainbow Alliance',
      'Heterosexuals Unafraid of Gays (HUG)',
    ],
    correctIndex: 3,
    explanation:
      'Heterosexuals Unafraid of Gays (HUG) was formed in Auckland in 1985, with a Wellington chapter following on 2 July 1985. The group showed solidarity from straight allies.',
  },
  {
    question: 'In what year did the New Zealand Parliament formally apologise for criminalising consensual homosexual activity?',
    options: ['2004', '2013', '2017', '2020'],
    correctIndex: 2,
    explanation:
      'On 6 July 2017, the New Zealand Parliament formally apologised for the historical criminalisation of consensual homosexual activity.',
  },
  {
    question: 'What international event in June 1969 had a major influence on the gay rights movement worldwide, including in New Zealand?',
    options: ['The Woodstock Festival', 'The Stonewall Riots', 'The March on Washington', 'The Paris Uprising'],
    correctIndex: 1,
    explanation:
      'The Stonewall Riots of 28 June 1969 in New York City sparked the worldwide Gay Liberation movement. Its impact was felt in New Zealand by the early 1970s.',
  },
  {
    question: 'Which Labour Prime Minister opposed treating homosexuality as "normal" in 1974?',
    options: ['David Lange', 'Norman Kirk', 'Helen Clark', 'Robert Muldoon'],
    correctIndex: 1,
    explanation:
      'Labour Prime Minister Norman Kirk publicly opposed treating homosexuality as "normal" on 9 July 1974, which led National MP Marilyn Waring to sign up with the Young Nationals in protest.',
  },
];

export function LawReformQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [quizComplete, setQuizComplete] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleNavigate = useCallback((sectionId: string) => {
    window.location.href = `/#${sectionId}`;
  }, []);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);
    if (index === questions[currentQuestion].correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setQuizComplete(true);
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers(new Array(questions.length).fill(null));
    setQuizComplete(false);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getScoreMessage = () => {
    const pct = (score / questions.length) * 100;
    if (pct === 100) return "Perfect score! You're a law reform history expert!";
    if (pct >= 80) return 'Excellent! You really know your New Zealand history!';
    if (pct >= 60) return 'Good effort! You know quite a bit about law reform history.';
    if (pct >= 40) return 'Not bad! There\'s more to discover about this important chapter in NZ history.';
    return 'Keep learning! This is a fascinating and important part of New Zealand\'s history.';
  };

  const q = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5A2E88]/5 via-white to-[#E91E8C]/5">
      <Navigation onNavigate={handleNavigate} />

      {/* Hero header */}
      <div
        ref={topRef}
        className="relative bg-gradient-to-r from-[#3D1C5E] via-[#5A2E88] to-[#E91E8C] text-white overflow-hidden pt-16"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-2">Law Reform Quiz</h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
            Test your knowledge about the history of homosexual law reform in New Zealand.
          </p>
        </div>
      </div>

      {/* Quiz content */}
      <div
        className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {!quizComplete ? (
          <>
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-sm font-medium text-[#5A2E88]">
                  Score: {score}/{currentQuestion + (showResult ? 1 : 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-[#5A2E88] to-[#E91E8C] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${((currentQuestion + (showResult ? 1 : 0)) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{q.question}</h2>

              <div className="space-y-3">
                {q.options.map((option, index) => {
                  let optionClass =
                    'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium';

                  if (showResult) {
                    if (index === q.correctIndex) {
                      optionClass += ' border-green-500 bg-green-50 text-green-800';
                    } else if (index === selectedAnswer && index !== q.correctIndex) {
                      optionClass += ' border-red-500 bg-red-50 text-red-800';
                    } else {
                      optionClass += ' border-gray-200 text-gray-400';
                    }
                  } else {
                    optionClass +=
                      ' border-gray-200 hover:border-[#5A2E88]/40 hover:bg-[#5A2E88]/5 text-gray-700 cursor-pointer';
                  }

                  return (
                    <button key={index} onClick={() => handleAnswer(index)} className={optionClass} disabled={showResult}>
                      <div className="flex items-center gap-3">
                        <span className="shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                        {showResult && index === q.correctIndex && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto shrink-0" />
                        )}
                        {showResult && index === selectedAnswer && index !== q.correctIndex && (
                          <XCircle className="w-5 h-5 text-red-600 ml-auto shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showResult && (
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#5A2E88]/5 to-[#E91E8C]/5 border border-[#5A2E88]/10">
                  <p className="text-sm font-semibold text-[#5A2E88] mb-1">
                    {selectedAnswer === q.correctIndex ? 'Correct!' : 'Not quite!'}
                  </p>
                  <p className="text-sm text-gray-600">{q.explanation}</p>
                </div>
              )}
            </div>

            {/* Next button */}
            {showResult && (
              <div className="flex justify-end">
                <button
                  onClick={nextQuestion}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {currentQuestion < questions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    'See Results'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Results screen */
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-[#5A2E88] to-[#E91E8C] mb-6">
                <span className="text-3xl font-black text-white">{score}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                You scored {score} out of {questions.length}
              </h2>
              <p className="text-lg text-gray-600 mb-8">{getScoreMessage()}</p>

              {/* Answer summary */}
              <div className="text-left space-y-3 mb-8">
                {questions.map((question, index) => {
                  const userAnswer = answers[index];
                  const isCorrect = userAnswer === question.correctIndex;
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        isCorrect ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{question.question}</p>
                        {!isCorrect && (
                          <p className="text-xs text-gray-500 mt-1">
                            Correct answer: {question.options[question.correctIndex]}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={restartQuiz} className="btn-primary inline-flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
                <a
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-[#5A2E88] text-[#5A2E88] font-semibold hover:bg-[#5A2E88]/5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </a>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Quiz content sourced from{' '}
              <a
                href="https://www.pridenz.com/time/homosexual_law_reform.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5A2E88] hover:underline"
              >
                Pride NZ
              </a>
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
