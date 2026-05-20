import { useState, useCallback } from 'react';
import { ArrowLeft, CheckCircle2, Send, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Navigation } from './Navigation';

export function ProgrammeOrder() {
  const [contactName, setContactName] = useState('');
  const [organisationName, setOrganisationName] = useState('');
  const [postalAddress, setPostalAddress] = useState('');
  const [numberOfProgrammes, setNumberOfProgrammes] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleNavigate = useCallback((sectionId: string) => {
    window.location.href = `/#${sectionId}`;
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!contactName.trim()) newErrors.contactName = 'Full name is required';
    if (!organisationName.trim()) newErrors.organisationName = 'Organisation name is required';
    if (!postalAddress.trim()) newErrors.postalAddress = 'Postal address is required';
    if (!numberOfProgrammes.trim()) {
      newErrors.numberOfProgrammes = 'Number of programmes is required';
    } else {
      const n = parseInt(numberOfProgrammes, 10);
      if (isNaN(n) || n < 1) newErrors.numberOfProgrammes = 'Must be at least 1';
    }
    if (!mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/programme-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: contactName.trim(),
          organisationName: organisationName.trim(),
          postalAddress: postalAddress.trim(),
          numberOfProgrammes: parseInt(numberOfProgrammes, 10),
          mobileNumber: mobileNumber.trim(),
          deliveryNotes: deliveryNotes.trim() || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit');
      setSubmitted(true);
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#784982]/5">
        <Navigation onNavigate={handleNavigate} />
        <div className="max-w-2xl mx-auto px-4 py-20 pt-36 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#784982] mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Received!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for ordering commemorative programmes for the 40th Anniversary celebrations.
            We'll be in touch when your programmes are ready to ship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#784982] text-white font-semibold hover:bg-[#5a3562] transition-colors rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </a>
            <button
              onClick={() => {
                setSubmitted(false);
                setContactName('');
                setOrganisationName('');
                setPostalAddress('');
                setNumberOfProgrammes('');
                setMobileNumber('');
                setDeliveryNotes('');
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#784982] text-[#784982] font-semibold hover:bg-[#784982]/5 transition-colors rounded-lg"
            >
              <FileText className="w-4 h-4" />
              Submit Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            40th Anniversary
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-white/90 mb-4" style={{ fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase' }}>
            Commemorative Programme
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Complete this form to be sent commemorative programmes for the 40th Celebrations of Homosexual Law Reform.
          </p>
          <p className="text-sm text-white/60 mt-4">
            When you submit this form, it will not automatically collect your details like name and email address unless you provide it yourself.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.form && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {errors.form}
            </div>
          )}

          {/* Contact Full Name */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <Label htmlFor="contactName" className="text-sm font-semibold text-gray-900 mb-2 block">
              1. Contact Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => { setContactName(e.target.value); setErrors(prev => { const n = {...prev}; delete n.contactName; return n; }); }}
              placeholder="Enter your full name"
              className={errors.contactName ? 'border-red-300' : ''}
            />
            {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
          </div>

          {/* Organisation Name */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <Label htmlFor="organisationName" className="text-sm font-semibold text-gray-900 mb-2 block">
              2. Contact Organisation Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="organisationName"
              value={organisationName}
              onChange={(e) => { setOrganisationName(e.target.value); setErrors(prev => { const n = {...prev}; delete n.organisationName; return n; }); }}
              placeholder="Enter your organisation name"
              className={errors.organisationName ? 'border-red-300' : ''}
            />
            {errors.organisationName && <p className="text-red-500 text-sm mt-1">{errors.organisationName}</p>}
          </div>

          {/* Postal Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <Label htmlFor="postalAddress" className="text-sm font-semibold text-gray-900 mb-2 block">
              3. Organisation Postal Address <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="postalAddress"
              value={postalAddress}
              onChange={(e) => { setPostalAddress(e.target.value); setErrors(prev => { const n = {...prev}; delete n.postalAddress; return n; }); }}
              placeholder="Enter the postal address for delivery"
              rows={3}
              className={errors.postalAddress ? 'border-red-300' : ''}
            />
            {errors.postalAddress && <p className="text-red-500 text-sm mt-1">{errors.postalAddress}</p>}
          </div>

          {/* Number of Programmes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <Label htmlFor="numberOfProgrammes" className="text-sm font-semibold text-gray-900 mb-2 block">
              4. Number of Programmes you would like <span className="text-red-500">*</span>
            </Label>
            <Input
              id="numberOfProgrammes"
              type="number"
              min="1"
              value={numberOfProgrammes}
              onChange={(e) => { setNumberOfProgrammes(e.target.value); setErrors(prev => { const n = {...prev}; delete n.numberOfProgrammes; return n; }); }}
              placeholder="Enter number of programmes"
              className={errors.numberOfProgrammes ? 'border-red-300' : ''}
            />
            {errors.numberOfProgrammes && <p className="text-red-500 text-sm mt-1">{errors.numberOfProgrammes}</p>}
          </div>

          {/* Mobile Number */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <Label htmlFor="mobileNumber" className="text-sm font-semibold text-gray-900 mb-2 block">
              5. Contact Mobile Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="mobileNumber"
              type="tel"
              value={mobileNumber}
              onChange={(e) => { setMobileNumber(e.target.value); setErrors(prev => { const n = {...prev}; delete n.mobileNumber; return n; }); }}
              placeholder="Enter your mobile number"
              className={errors.mobileNumber ? 'border-red-300' : ''}
            />
            {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}
          </div>

          {/* Delivery Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <Label htmlFor="deliveryNotes" className="text-sm font-semibold text-gray-900 mb-2 block">
              6. Any other delivery notes
            </Label>
            <Textarea
              id="deliveryNotes"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Any special delivery instructions or notes (optional)"
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#784982] hover:bg-[#5a3562] text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Order
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
