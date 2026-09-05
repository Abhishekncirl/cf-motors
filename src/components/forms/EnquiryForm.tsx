import { useState, type FormEvent } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { TextField, TextAreaField } from './Fields';
import { submitEnquiry } from '../../lib/enquiries';
import type { EnquiryType } from '../../lib/types';
import { requiredText, validEmail, validPhone, isClean } from '../../lib/validate';

interface Props {
  type: EnquiryType;
  vehicleId?: string | null;
  defaultMessage?: string;
  title?: string;
  compact?: boolean;
}

/** Reusable enquiry form (general / vehicle). Writes to Firestore. */
export function EnquiryForm({ type, vehicleId, defaultMessage, title, compact }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(defaultMessage ?? '');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const validate = () => {
    const next = {
      name: requiredText(name, 'name'),
      email: validEmail(email),
      phone: validPhone(phone),
      message: requiredText(message, 'message'),
    };
    setErrors(next);
    return isClean(next);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    try {
      await submitEnquiry({ type, vehicleId, name, email, phone, message });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="card flex items-start gap-3 p-6">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-brand-cyan" aria-hidden />
        <div>
          <h3 className="font-display text-lg font-bold">Thanks, {name.split(' ')[0]}!</h3>
          <p className="mt-1 text-sm text-brand-white/70">
            Your enquiry is in. We’ll be in touch shortly - usually the same day.
            For anything urgent, message us on WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={compact ? '' : 'card p-6'}>
      {title && <h3 className="mb-4 font-display text-xl font-bold">{title}</h3>}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" name="name" required value={name} onChange={setName} error={errors.name} autoComplete="name" />
        <TextField label="Phone" name="phone" required type="tel" inputMode="tel" value={phone} onChange={setPhone} error={errors.phone} autoComplete="tel" />
      </div>
      <div className="mt-4">
        <TextField label="Email" name="email" required type="email" inputMode="email" value={email} onChange={setEmail} error={errors.email} autoComplete="email" />
      </div>
      <div className="mt-4">
        <TextAreaField label="Message" name="message" required value={message} onChange={setMessage} error={errors.message} placeholder="Tell us what you’re looking for…" />
      </div>

      {status === 'error' && (
        <p className="mt-4 flex items-center gap-2 text-sm text-red-400" role="alert">
          <AlertCircle size={16} aria-hidden /> Something went wrong sending your enquiry. Please try again or call us.
        </p>
      )}

      <button type="submit" className="btn-primary mt-5 w-full sm:w-auto" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send enquiry'}
      </button>
      <p className="mt-3 text-xs text-brand-white/45">
        By submitting you agree to our privacy policy. We only use your details to respond to your enquiry.
      </p>
    </form>
  );
}
