import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Heart,
  Send,
  Video,
  FileText,
  Upload,
  X,
  CheckCircle,
  ArrowLeft,
  Mic,
  Square,
  Play,
  Trash2,
  AlertCircle,
  Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';

type LetterTypeOption = 'to-myself' | 'to-passed' | 'to-future-self' | 'to-someone-special';
type SubmissionMode = 'text' | 'video';

const letterTypeLabels: Record<LetterTypeOption, { label: string; description: string }> = {
  'to-myself': {
    label: 'A letter to myself',
    description: 'Write words of love, encouragement, and acceptance to yourself.',
  },
  'to-passed': {
    label: 'To someone who has passed',
    description: 'Share the words you wish you could say to someone no longer with us.',
  },
  'to-future-self': {
    label: 'To my future self',
    description: 'Write a message of hope and love to the person you are becoming.',
  },
  'to-someone-special': {
    label: 'To someone special',
    description: 'Express your love and gratitude to someone who matters to you.',
  },
};

interface ApprovedLetter {
  id: string;
  authorName: string;
  letterType: LetterTypeOption;
  recipientName: string;
  message: string;
  createdAt: string;
}

export function LettersOfLove() {
  const [mode, setMode] = useState<SubmissionMode | null>(null);
  const [approvedLetters, setApprovedLetters] = useState<ApprovedLetter[]>([]);
  const [lettersLoading, setLettersLoading] = useState(true);
  const [letterType, setLetterType] = useState<LetterTypeOption>('to-myself');
  const [authorName, setAuthorName] = useState('');
  const [email, setEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [galaPermission, setGalaPermission] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_RECORDING_SECONDS = 120;
  const MAX_FILE_SIZE_MB = 50;

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraReady(true);
    } catch {
      setCameraError(
        'Unable to access camera/microphone. Please ensure you have granted permission in your browser settings.'
      );
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const file = new File([blob], `recording-${Date.now()}.webm`, { type: mimeType });
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(blob));
      stopCamera();
    };

    mediaRecorderRef.current = recorder;
    recorder.start(1000);
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= MAX_RECORDING_SECONDS - 1) {
          recorder.stop();
          setIsRecording(false);
          if (timerRef.current) clearInterval(timerRef.current);
          return prev + 1;
        }
        return prev + 1;
      });
    }, 1000);
  }, [stopCamera]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopCamera]);

  // Fetch approved letters for carousel
  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const res = await fetch('/.netlify/functions/get-approved-letters');
        if (res.ok) {
          const data = await res.json();
          setApprovedLetters(data.letters || []);
        }
      } catch (err) {
        console.error('Failed to fetch approved letters:', err);
      } finally {
        setLettersLoading(false);
      }
    };
    fetchLetters();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setErrors((prev) => ({ ...prev, video: 'Please select a video file.' }));
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, video: `Video must be under ${MAX_FILE_SIZE_MB}MB.` }));
      return;
    }

    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.video;
      return next;
    });
  };

  const removeVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (mode === 'text' && !message.trim()) {
      errs.message = 'Please write your letter.';
    }
    if (mode === 'video' && !videoFile) {
      errs.video = 'Please record or upload a video.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      let videoKey: string | null = null;

      // Upload video first if present
      if (videoFile) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(videoFile);
        });

        const videoRes = await fetch('/.netlify/functions/upload-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoData: base64, contentType: videoFile.type }),
        });

        if (!videoRes.ok) throw new Error('Video upload failed');
        const videoData = await videoRes.json();
        videoKey = videoData.key;
      }

      // Save letter
      const res = await fetch('/.netlify/functions/save-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: authorName.trim() || 'Anonymous',
          email: email.trim(),
          letterType,
          recipientName: recipientName.trim(),
          message: message.trim(),
          videoKey,
          galaPermission,
        }),
      });

      if (!res.ok) throw new Error('Failed to save letter');
      setIsSubmitted(true);
    } catch (err) {
      console.error('Submit error:', err);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5A2E88]/5 via-white to-[#E91E8C]/5">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-[#5A2E88] to-[#E91E8C] mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank you for sharing your love</h1>
          <p className="text-lg text-gray-600 mb-4">
            Your letter has been received and will be reviewed by our team.
          </p>
          {galaPermission && (
            <p className="text-gray-500 mb-8">
              Thank you for granting permission to include your message in the National Gala Event
              time capsule. We will be in touch if your submission is selected.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#5A2E88] to-[#E91E8C] text-white font-semibold hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </a>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setMode(null);
                setMessage('');
                setVideoFile(null);
                setVideoPreviewUrl(null);
                setAuthorName('');
                setEmail('');
                setRecipientName('');
                setGalaPermission(false);
                setLetterType('to-myself');
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-[#5A2E88] text-[#5A2E88] font-semibold hover:bg-[#5A2E88]/5 transition-colors"
            >
              <Heart className="w-4 h-4" />
              Write Another Letter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5A2E88]/5 via-white to-[#E91E8C]/5">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#3D1C5E] via-[#5A2E88] to-[#E91E8C] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur mb-6">
            <Heart className="w-8 h-8 text-white fill-current" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Letters of Love</h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
            Homosexual law reform was born from a movement of love - the right to love who you choose.
            Share your love through a letter or video message.
          </p>
          <p className="text-white/70 mt-4 max-w-xl mx-auto">
            Write to yourself, to someone who has passed, to your future self, or to someone special.
            Your words may become part of a time capsule at the National Gala Event.
          </p>
        </div>
      </div>

      {/* Approved Letters Carousel */}
      {!lettersLoading && approvedLetters.length > 0 && (
        <div className="bg-gradient-to-b from-[#5A2E88]/5 to-transparent py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Letters from the Community
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                Read what others have shared. Be inspired to write your own letter of love.
              </p>
            </div>

            <div className="relative px-12">
              <Carousel
                opts={{
                  align: 'start',
                  loop: approvedLetters.length > 1,
                }}
              >
                <CarouselContent className="-ml-4">
                  {approvedLetters.map((letter) => (
                    <CarouselItem
                      key={letter.id}
                      className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                    >
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#5A2E88]/10 to-[#E91E8C]/10 flex items-center justify-center">
                            <Quote className="w-4 h-4 text-[#5A2E88]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {letter.authorName}
                            </p>
                            <p className="text-xs text-[#E91E8C]">
                              {letterTypeLabels[letter.letterType]?.label || 'A letter of love'}
                            </p>
                          </div>
                        </div>
                        <div className="flex-1 mb-4">
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-6">
                            {letter.message}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-400">
                            {new Date(letter.createdAt).toLocaleDateString('en-NZ', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="bg-white border-gray-200 hover:bg-gray-50 shadow-md -left-6" />
                <CarouselNext className="bg-white border-gray-200 hover:bg-gray-50 shadow-md -right-6" />
              </Carousel>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mode selection */}
        {!mode && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How would you like to share your love?</h2>
              <p className="text-gray-500">Choose to write a letter or record a video message.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button
                onClick={() => setMode('text')}
                className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:border-[#5A2E88]/30 hover:shadow-xl transition-all duration-300 text-left"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r from-[#5A2E88]/10 to-[#E91E8C]/10 mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-7 h-7 text-[#5A2E88]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Write a Letter</h3>
                <p className="text-gray-500">
                  Pour your heart out in words. Write a love letter that speaks from the soul.
                </p>
              </button>
              <button
                onClick={() => setMode('video')}
                className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:border-[#E91E8C]/30 hover:shadow-xl transition-all duration-300 text-left"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r from-[#E91E8C]/10 to-[#5A2E88]/10 mb-4 group-hover:scale-110 transition-transform">
                  <Video className="w-7 h-7 text-[#E91E8C]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Record a Video</h3>
                <p className="text-gray-500">
                  Record a video message or upload one. Say it with your voice and heart.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {mode && (
          <div className="space-y-8">
            <button
              onClick={() => {
                setMode(null);
                removeVideo();
                stopCamera();
              }}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-[#5A2E88] transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to options
            </button>

            {/* Letter type selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <Label className="text-base font-semibold text-gray-900 mb-4 block">
                Who is this letter for?
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(letterTypeLabels) as LetterTypeOption[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setLetterType(type)}
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      letterType === type
                        ? 'border-[#5A2E88] bg-[#5A2E88]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p
                      className={`font-semibold text-sm ${
                        letterType === type ? 'text-[#5A2E88]' : 'text-gray-900'
                      }`}
                    >
                      {letterTypeLabels[type].label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{letterTypeLabels[type].description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Your Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author-name" className="text-sm text-gray-700">
                    Your Name <span className="text-gray-400">(optional)</span>
                  </Label>
                  <Input
                    id="author-name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Leave blank for anonymous"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => { const next = { ...prev }; delete next.email; return next; });
                    }}
                    placeholder="your@email.com"
                    className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    Your email won't be shared publicly. It's only used if we need to contact you.
                  </p>
                </div>
              </div>

              {(letterType === 'to-passed' || letterType === 'to-someone-special') && (
                <div>
                  <Label htmlFor="recipient-name" className="text-sm text-gray-700">
                    Recipient's Name <span className="text-gray-400">(optional)</span>
                  </Label>
                  <Input
                    id="recipient-name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Who is this letter for?"
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* Text letter */}
            {mode === 'text' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Label htmlFor="letter-message" className="text-base font-semibold text-gray-900 mb-2 block">
                  Your Letter
                </Label>
                <p className="text-sm text-gray-500 mb-4">
                  Take your time. There's no right or wrong way to express love.
                </p>
                <Textarea
                  id="letter-message"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors((prev) => { const next = { ...prev }; delete next.message; return next; });
                  }}
                  placeholder="Dear..."
                  rows={10}
                  className={`resize-none text-base leading-relaxed ${errors.message ? 'border-red-500' : ''}`}
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>
            )}

            {/* Video */}
            {mode === 'video' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Your Video Message</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Record a video (up to 2 minutes) or upload one (up to {MAX_FILE_SIZE_MB}MB).
                  </p>
                </div>

                {/* Video preview */}
                {videoPreviewUrl && !isRecording && (
                  <div className="relative rounded-xl overflow-hidden bg-black">
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full max-h-[400px]"
                    />
                    <button
                      onClick={removeVideo}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Camera view for recording */}
                {!videoPreviewUrl && (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className={`w-full h-full object-cover ${cameraReady ? '' : 'hidden'}`}
                      />
                      {!cameraReady && !cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                          <Video className="w-12 h-12 mb-3" />
                          <p className="text-sm">Camera preview will appear here</p>
                        </div>
                      )}
                      {cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 p-6 text-center">
                          <AlertCircle className="w-10 h-10 mb-3 text-red-400" />
                          <p className="text-sm">{cameraError}</p>
                        </div>
                      )}
                      {isRecording && (
                        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-full">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          Recording {formatTime(recordingTime)} / {formatTime(MAX_RECORDING_SECONDS)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {!cameraReady && !isRecording && (
                        <Button
                          onClick={startCamera}
                          className="bg-gradient-to-r from-[#5A2E88] to-[#E91E8C] hover:opacity-90"
                        >
                          <Mic className="w-4 h-4 mr-2" />
                          Open Camera
                        </Button>
                      )}
                      {cameraReady && !isRecording && (
                        <>
                          <Button
                            onClick={startRecording}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Recording
                          </Button>
                          <Button variant="outline" onClick={stopCamera}>
                            <X className="w-4 h-4 mr-2" />
                            Close Camera
                          </Button>
                        </>
                      )}
                      {isRecording && (
                        <Button
                          onClick={stopRecording}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          Stop Recording
                        </Button>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-4 text-gray-400">or upload a video file</span>
                      </div>
                    </div>

                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#5A2E88]/40 hover:text-[#5A2E88] cursor-pointer transition-colors"
                      >
                        <Upload className="w-5 h-5" />
                        Choose video file (max {MAX_FILE_SIZE_MB}MB)
                      </label>
                    </div>
                  </div>
                )}

                {errors.video && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.video}
                  </p>
                )}

                {/* Optional text message with video */}
                <div>
                  <Label htmlFor="video-message" className="text-sm text-gray-700">
                    Add a written message too <span className="text-gray-400">(optional)</span>
                  </Label>
                  <Textarea
                    id="video-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="You can also include a written message alongside your video..."
                    rows={4}
                    className="mt-1 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Gala Permission */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex items-center h-6 mt-0.5">
                  <input
                    id="gala-permission"
                    type="checkbox"
                    checked={galaPermission}
                    onChange={(e) => setGalaPermission(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-[#5A2E88] focus:ring-[#5A2E88] cursor-pointer"
                  />
                </div>
                <div>
                  <Label htmlFor="gala-permission" className="text-base font-semibold text-gray-900 cursor-pointer">
                    Permission for National Gala Event
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    I give permission for my letter/video to be considered for use as part of a
                    time capsule or montage at the National Gala Event celebrating 40 years of
                    Homosexual Law Reform. I understand that my submission may be displayed publicly
                    and that the organisers will contact me before using my message.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {errors.submit}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-[#5A2E88] to-[#E91E8C] hover:opacity-90 h-12 text-base font-semibold"
              >
                {isSubmitting ? (
                  'Sending your love...'
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Letter of Love
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-gray-400">
            All submissions are reviewed before being published. Your privacy is respected.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[#5A2E88] hover:underline mt-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Return to 40 Years
          </a>
        </div>
      </div>
    </div>
  );
}
