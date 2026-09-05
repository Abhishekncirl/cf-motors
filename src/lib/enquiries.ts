import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore/lite';
import { requireDb } from './firebase';
import type { Enquiry, EnquiryType } from './types';

export const ENQUIRIES = 'enquiries';

export interface EnquiryInput {
  vehicleId?: string | null;
  type: EnquiryType;
  name: string;
  email: string;
  phone: string;
  message: string;
  payload?: Record<string, unknown>;
}

/**
 * Persist an enquiry to Firestore. A Firebase Cloud Function (see
 * functions/README) listens to new `enquiries` documents and emails the dealer.
 * We deliberately keep email out of the client so no SMTP credentials ship in
 * the bundle.
 */
export async function submitEnquiry(input: EnquiryInput): Promise<string> {
  const db = requireDb();
  const ref = await addDoc(collection(db, ENQUIRIES), {
    vehicleId: input.vehicleId ?? null,
    type: input.type,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    message: input.message.trim(),
    payload: input.payload ?? {},
    isRead: false,
    isActioned: false,
    createdAt: Date.now(),
    _serverCreatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listEnquiries(): Promise<Enquiry[]> {
  const db = requireDb();
  const snap = await getDocs(query(collection(db, ENQUIRIES), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      vehicleId: data.vehicleId ?? null,
      type: data.type,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      payload: data.payload ?? {},
      isRead: Boolean(data.isRead),
      isActioned: Boolean(data.isActioned),
      createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
    } satisfies Enquiry;
  });
}

export async function setEnquiryFlags(
  id: string,
  flags: { isRead?: boolean; isActioned?: boolean }
): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, ENQUIRIES, id), flags);
}
