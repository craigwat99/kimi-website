import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, ArrowLeft, PenLine, Video, Send, CheckCircle2, AlertCircle, ImageIcon, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel';
import { compressImage } from '@/utils/images';

const letterTypes: Record<string, { label: string; description: string }> = {
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
  letterType: string;
  message: string;
  imageKey: string | null;
  createdAt: string;
}

const MAX_VIDEO_SIZE_MB = 50;
const MAX_RECORDING_SECONDS = 120;

export function LettersOfLove() {
  const [mode, setMode] = useState<'text' | 'video' | null>(null);
  const [approvedLetters, setApprovedLetters] = useState<ApprovedLetter[]>([]);
  const [loadingLetters, setLoadingLetters] = useState(true);
  const [letterType, setLetterType] = useState('to-myself');
  const [authorName, setAuthorName] = useState('');
  const [email, setEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [galaPermission, setGalaPermission] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [viewingLetter, setViewingLetter] = useState<ApprovedLetter | null>(null);
  const [letterCarouselApi, setLetterCarouselApi] = useState<CarouselApi | null>(null);

  // Image state (for text letters)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
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
      setErrors((prev) => ({
        ...prev,
        video: 'Unable to access camera/microphone. Please ensure you have granted permission in your browser settings.',
      }));
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

  // Fetch approved letters
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/.netlify/functions/get-approved-letters');
        if (res.ok) {
          const data = await res.json();
          setApprovedLetters(data.letters || []);
        }
      } catch (err) {
        console.error('Failed to fetch approved letters:', err);
      } finally {
        setLoadingLetters(false);
      }
    })();
  }, []);

  // Auto-scroll the approved letters carousel
  useEffect(() => {
    if (!letterCarouselApi || approvedLetters.length <= 1) return;
    const interval = setInterval(() => {
      if (!letterCarouselApi) return;
      if (letterCarouselApi.canScrollNext()) {
        letterCarouselApi.scrollNext();
      } else {
        letterCarouselApi.scrollTo(0);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [letterCarouselApi, approvedLetters.length]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setErrors((prev) => ({ ...prev, video: 'Please select a video file.' }));
      return;
    }
    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, video: `Video must be under ${MAX_VIDEO_SIZE_MB}MB.` }));
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Please select an image file.' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image must be under 10MB.' }));
      return;
    }
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });
  };

  const removeImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
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
    setSubmitting(true);
    try {
      let videoKey: string | null = null;
      let imageKey: string | null = null;

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
        const uploadRes = await fetch('/.netlify/functions/upload-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoData: base64, contentType: videoFile.type }),
        });
        if (!uploadRes.ok) throw new Error('Video upload failed');
        videoKey = (await uploadRes.json()).key;
      }

      if (imageFile) {
        const { base64, contentType } = await compressImage(imageFile);
        const uploadRes = await fetch('/.netlify/functions/upload-letter-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: base64, contentType }),
        });
        if (!uploadRes.ok) throw new Error('Image upload failed');
        imageKey = (await uploadRes.json()).key;
      }

      const saveRes = await fetch('/.netlify/functions/save-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: authorName.trim() || 'Anonymous',
          email: email.trim(),
          letterType,
          recipientName: recipientName.trim(),
          message: message.trim(),
          videoKey,
          imageKey,
          galaPermission,
        }),
      });
      if (!saveRes.ok) throw new Error('Failed to save letter');
      setSubmitted(true);

      // Notify admin of new love letter submission
      fetch('/.netlify/functions/send-admin-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'letter',
          name: authorName.trim() || 'Anonymous',
          submitterEmail: email.trim(),
          details: {
            'Author': authorName.trim() || 'Anonymous',
            'Letter Type': letterType,
            'Recipient': recipientName.trim() || undefined,
            'Has Video': videoFile ? 'Yes' : 'No',
            'Gala Permission': galaPermission ? 'Yes' : 'No',
          },
        }),
      }).catch(() => {});
    } catch (err) {
      console.error('Submit error:', err);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#784982]/5">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#784982] mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
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
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#784982] text-white font-semibold hover:bg-[#5a3562] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </a>
            <button
              onClick={() => {
                setSubmitted(false);
                setMode(null);
                setMessage('');
                setVideoFile(null);
                setVideoPreviewUrl(null);
                setImageFile(null);
                setImagePreviewUrl(null);
                setAuthorName('');
                setEmail('');
                setRecipientName('');
                setGalaPermission(false);
                setLetterType('to-myself');
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#784982] text-[#784982] font-semibold hover:bg-[#784982]/5 transition-colors"
            >
              <Heart className="w-4 h-4" />
              Write Another Letter
            </button>
          </div>
        </div>
      </div>
    );
  }

  const marqueeLetters =
    approvedLetters.length > 0 ? [...approvedLetters, ...approvedLetters] : [];

  return (
    <div className="min-h-screen bg-[#784982]/5">
      {/* Hero header */}
      <div className="relative bg-[#784982] text-white overflow-hidden">
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
            Homosexual law reform was born from a movement of love - the right to love who you
            choose. Share your love through a letter or video message.
          </p>
          <p className="text-white/70 mt-4 max-w-xl mx-auto">
            Write to yourself, to someone who has passed, to your future self, or to someone
            special. Your words may become part of a time capsule at the National Gala Event.
          </p>
        </div>

        {/* Scrolling letters marquee */}
        {marqueeLetters.length > 0 && (
          <div
            className="relative pb-12 overflow-hidden"
            style={{
              maskImage:
                'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
              WebkitMaskImage:
                'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            }}
          >
            <div className="flex gap-6 w-max animate-[marquee_60s_linear_infinite] hover:[animation-play-state:paused]">
              {marqueeLetters.map((letter, i) => (
                <button
                  key={`${letter.id}-${i}`}
                  onClick={() => setViewingLetter(letter)}
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
                        {letterTypes[letter.letterType]?.label || 'A letter of love'}
                      </p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed line-clamp-4">
                    {letter.message}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form area */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mode selection */}
        {!mode && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl leading-normal font-bold text-gray-900 mb-2">
                How would you like to share your love?
              </h2>
              <p className="text-gray-500">Choose to write a letter or record a video message.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button
                onClick={() => setMode('text')}
                className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:border-[#784982]/30 hover:shadow-xl transition-all duration-300 text-left"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#784982]/10 mb-4 group-hover:scale-110 transition-transform">
                  <PenLine className="w-7 h-7 text-[#784982]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Write a Letter</h3>
                <p className="text-gray-500">
                  Pour your heart out in words. Write a love letter that speaks from the soul.
                </p>
              </button>
              <button
                onClick={() => setMode('video')}
                className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:border-[#e5c858]/30 hover:shadow-xl transition-all duration-300 text-left"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#e5c858]/10 mb-4 group-hover:scale-110 transition-transform">
                  <Video className="w-7 h-7 text-[#e5c858]" />
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
              className="inline-flex items-center gap-2 text-gray-500 hover:text-[#784982] transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to options
            </button>

            {/* Letter type */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <Label className="text-base font-semibold text-gray-900 mb-4 block">
                Who is this letter for?
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(letterTypes).map((key) => (
                  <button
                    key={key}
                    onClick={() => setLetterType(key)}
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      letterType === key
                        ? 'border-[#784982] bg-[#784982]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p
                      className={`font-semibold text-sm ${
                        letterType === key ? 'text-[#784982]' : 'text-gray-900'
                      }`}
                    >
                      {letterTypes[key].label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{letterTypes[key].description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
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
                      if (errors.email)
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.email;
                          return next;
                        });
                    }}
                    placeholder="your@email.com"
                    className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
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
                    if (errors.message)
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.message;
                        return next;
                      });
                  }}
                  placeholder="Dear..."
                  rows={10}
                  className={`resize-none text-base leading-relaxed ${
                    errors.message ? 'border-red-500' : ''
                  }`}
                />
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                )}

                {/* Image upload */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Attach a Photo <span className="text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Upload a photo of a handwritten letter or an image to go with your message.
                  </p>

                  {!imagePreviewUrl ? (
                    <div>
                      <label
                        htmlFor="letter-image"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#784982]/40 hover:bg-[#784982]/5 transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload an image</span>
                        <span className="text-xs text-gray-400 mt-1">JPG, PNG, GIF up to 10MB</span>
                      </label>
                      <input
                        ref={imageInputRef}
                        id="letter-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreviewUrl}
                        alt="Preview"
                        className="w-full max-h-64 object-contain rounded-xl border border-gray-200"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-colors"
                        type="button"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                  {errors.image && (
                    <p className="text-red-500 text-xs mt-1">{errors.image}</p>
                  )}
                </div>
              </div>
            )}

            {/* Video */}
            {mode === 'video' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Your Video Message</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Record a video (up to 2 minutes) or upload one (up to {MAX_VIDEO_SIZE_MB}MB).
                  </p>
                </div>

                {!videoPreviewUrl && (
                  <div className="space-y-4">
                    {/* Camera preview */}
                    <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                      {cameraReady ? (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <p className="text-sm">Camera preview will appear here</p>
                        </div>
                      )}
                      {isRecording && (
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          {formatTime(recordingTime)} / {formatTime(MAX_RECORDING_SECONDS)}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 justify-center">
                      {!cameraReady && !isRecording && (
                        <Button
                          onClick={startCamera}
                          variant="outline"
                          className="gap-2"
                        >
                          <Video className="w-4 h-4" />
                          Start Camera
                        </Button>
                      )}
                      {cameraReady && !isRecording && (
                        <Button
                          onClick={startRecording}
                          className="gap-2 bg-red-600 hover:bg-red-700"
                        >
                          <div className="w-3 h-3 bg-white rounded-full" />
                          Start Recording
                        </Button>
                      )}
                      {isRecording && (
                        <Button
                          onClick={stopRecording}
                          variant="destructive"
                          className="gap-2"
                        >
                          Stop Recording
                        </Button>
                      )}
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-2">or upload a video file</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload}
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#784982]/10 file:text-[#784982] hover:file:bg-[#784982]/20"
                      />
                    </div>
                  </div>
                )}

                {videoPreviewUrl && (
                  <div className="space-y-3">
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full aspect-video bg-black rounded-xl"
                    />
                    <Button onClick={removeVideo} variant="outline" size="sm">
                      Remove video
                    </Button>
                  </div>
                )}

                {errors.video && (
                  <p className="text-red-500 text-xs">{errors.video}</p>
                )}

                {/* Optional written message with video */}
                <div>
                  <Label htmlFor="video-message" className="text-sm text-gray-700">
                    Written message <span className="text-gray-400">(optional)</span>
                  </Label>
                  <Textarea
                    id="video-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a written message to go with your video..."
                    rows={4}
                    className="mt-1 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Gala permission */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex items-center h-6 mt-0.5">
                  <input
                    id="gala-permission"
                    type="checkbox"
                    checked={galaPermission}
                    onChange={(e) => setGalaPermission(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-[#784982] focus:ring-[#784982] cursor-pointer"
                  />
                </div>
                <div>
                  <Label htmlFor="gala-permission" className="text-base font-semibold text-gray-900 cursor-pointer">
                    Permission for National Gala Event
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    I give permission for my letter/video to be considered for use as part of a
                    time capsule and in relation to events celebrating 40 years of Homosexual
                    Law Reform. I understand that my submission may be reproduced publicly in
                    relation to the 40th anniversary without requiring further consent and that
                    it may be deposited with archives in the future.
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

            {/* Submit button */}
            <div className="flex gap-4">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-[#784982] hover:bg-[#5a3562] h-12 text-base font-semibold"
              >
                {submitting ? (
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

      {/* Approved letters carousel */}
      {!loadingLetters && approvedLetters.length > 0 && (
        <div className="bg-[#784982]/5 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl leading-normal sm:leading-normal font-bold text-gray-900 mb-2">
                Letters from the Community
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                Read what others have shared. Be inspired to write your own letter of love.
              </p>
            </div>
            <div className="relative px-12">
              <Carousel opts={{ align: 'start', loop: approvedLetters.length > 1 }} setApi={setLetterCarouselApi}>
                <CarouselContent className="-ml-4">
                  {approvedLetters.map((letter) => (
                    <CarouselItem
                      key={letter.id}
                      className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                    >
                      <button
                        onClick={() => setViewingLetter(letter)}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col text-left w-full hover:shadow-lg hover:border-[#784982]/20 transition-all duration-200 overflow-hidden"
                      >
                        {letter.imageKey && (
                          <div className="w-full aspect-[16/10] overflow-hidden bg-gray-100">
                            <img
                              src={`/.netlify/functions/get-letter-image?key=${encodeURIComponent(letter.imageKey)}`}
                              alt="Letter attachment"
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-[#784982]/10 flex items-center justify-center">
                              <PenLine className="w-4 h-4 text-[#784982]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">
                                {letter.authorName}
                              </p>
                              <p className="text-xs text-[#e5c858]">
                                {letterTypes[letter.letterType]?.label || 'A letter of love'}
                              </p>
                            </div>
                          </div>
                          <div className="flex-1 mb-4">
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-6">
                              {letter.message}
                            </p>
                          </div>
                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                              {new Date(letter.createdAt).toLocaleDateString('en-NZ', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                            <span className="text-xs text-[#784982] font-medium">Read more</span>
                          </div>
                        </div>
                      </button>
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

      {/* Footer note */}
      <div className="border-t border-gray-200 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-gray-400">
            All submissions are reviewed before being published. Your privacy is respected.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[#784982] hover:underline mt-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Return to 40 Years
          </a>
        </div>
      </div>

      {/* View Letter Dialog */}
      <Dialog open={!!viewingLetter} onOpenChange={() => setViewingLetter(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-[#784982]/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#784982]" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{viewingLetter?.authorName}</p>
                <p className="text-sm font-normal text-[#e5c858]">
                  {viewingLetter && (letterTypes[viewingLetter.letterType]?.label || 'A letter of love')}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          {viewingLetter && (
            <div className="space-y-4 mt-2">
              {viewingLetter.imageKey && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={`/.netlify/functions/get-letter-image?key=${encodeURIComponent(viewingLetter.imageKey)}`}
                    alt="Letter attachment"
                    className="w-full max-h-96 object-contain bg-gray-50"
                  />
                </div>
              )}
              <div className="bg-[#784982]/5 rounded-xl p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {viewingLetter.message}
                </p>
              </div>
              <p className="text-xs text-gray-400 text-right">
                {new Date(viewingLetter.createdAt).toLocaleDateString('en-NZ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
