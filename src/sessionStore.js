import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const COLLECTION = 'studySessions';

function checkCanJoin(session, name) {
  const taken = session.attendees.some(
    (attendee) => attendee.toLowerCase() === name.toLowerCase()
  );
  if (taken) throw new Error(`${name} is already in this session.`);
  if (session.attendees.length >= session.seats) {
    throw new Error('This session is full.');
  }
}

const firestoreStore = {
  subscribe(onChange, onError) {
    return onSnapshot(
      collection(db, COLLECTION),
      (snapshot) => {
        onChange(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      onError
    );
  },

  async create(session) {
    await addDoc(collection(db, COLLECTION), {
      ...session,
      attendees: [session.host],
      createdAt: serverTimestamp(),
    });
  },

  // A transaction keeps two people from grabbing the last seat at once.
  async join(sessionId, name) {
    const ref = doc(db, COLLECTION, sessionId);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error('That session no longer exists.');
      const session = snap.data();
      checkCanJoin(session, name);
      tx.update(ref, { attendees: [...session.attendees, name] });
    });
  },
};

function createMemoryStore() {
  let sessions = [];
  const listeners = new Set();
  const emit = () => listeners.forEach((listener) => listener(sessions));

  return {
    subscribe(onChange) {
      listeners.add(onChange);
      onChange(sessions);
      return () => listeners.delete(onChange);
    },

    async create(session) {
      const id = String(Date.now());
      sessions = [...sessions, { ...session, id, attendees: [session.host] }];
      emit();
    },

    async join(sessionId, name) {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) throw new Error('That session no longer exists.');
      checkCanJoin(session, name);
      sessions = sessions.map((s) =>
        s.id === sessionId ? { ...s, attendees: [...s.attendees, name] } : s
      );
      emit();
    },
  };
}

export const sessionStore = isFirebaseConfigured
  ? firestoreStore
  : createMemoryStore();
