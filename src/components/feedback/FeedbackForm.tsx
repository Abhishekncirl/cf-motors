import { useState, type FormEvent } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { TextField, TextAreaField } from '../forms/Fields';
import { StarInput } from './Stars';
import { submitFeedback } from '../../lib/feedback';
import { requiredText, minLength, isClean } from '../../lib/validate';

/** Public review form. Writes to Firestore; the review is hidden until approved. */
export function FeedbackForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const validate = () => {
    const next = {
      author: requiredText(author, 'name'),
      rating: rating < 1 ? 'Please choose a star rating.' : undefined,
      message: requiredText(message, 'review') || minLength(message, 10, 'review'),
    };
    setErrors(next);
    return isClean(next);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    try {
      await submitFeedback({ author, rating, subject, message });
      setStatus('sent');
      onSubmitted?.();
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="card flex items-start gap-3 p-6">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-teal" aria-hidden />
        <div>
          <h3 className="font-display text-lg font-bold">
            Thank you{author ? `, ${author.split(' ')[0]}` : ''}!
          </h3>
          <p className="mt-1 text-sm text-ink/70">
            Your review has been submitted. We check reviews before they go live, so it should
            appear on this page shortly. We really appreciate you taking the time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card p-6">
      <h3 className="font-display text-xl font-bold">Leave a review</h3>
      <p className="mt-1 text-sm text-ink/60">
        Bought a car, sold one to us, or ordered a part? Tell others about your experience.
      </p>

      <div className="mt-5">
        <span className="field-label">Your rating <span className="text-teal">*</span></span>
        <div className="mt-1">
          <StarInput value={rating} onChange={setRating} />
        </div>
        {errors.rating && (
          <p className="field-error" role="alert">
            {errors.rating}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <TextField
          label="Your name"
          name="author"
          required
          value={author}
          onChange={setAuthor}
          error={errors.author}
          autoComplete="name"
          placeholder="e.g. John D."
          hint="Shown with your review."
        />
        <TextField
          label="Car or service (optional)"
          name="subject"
          value={subject}
          onChange={setSubject}
          placeholder="e.g. Honda Civic import"
        />
      </div>

      <div className="mt-4">
        <TextAreaField
          label="Your review"
          name="message"
          required
          rows={5}
          value={message}
          onChange={setMessage}
          error={errors.message}
          placeholder="What was your experience like?"
        />
      </div>

      {status === 'error' && (
        <p className="mt-4 flex items-center gap-2 text-sm text-red-500" role="alert">
          <AlertCircle size={16} aria-hidden /> Something went wrong submitting your review. Please
          try again.
        </p>
      )}

      <button type="submit" className="btn-primary mt-5 w-full sm:w-auto" disabled={status === 'sending'}>
        {status === 'sending' ? 'Submitting…' : 'Submit review'}
      </button>
      <p className="mt-3 text-xs text-ink/45">
        Reviews are checked before publishing. Please keep it honest and respectful - don’t include
        personal or private information.
      </p>
    </form>
  );
}
