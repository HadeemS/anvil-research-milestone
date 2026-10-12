import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import SessionForm from './src/components/SessionForm';
import SessionCard from './src/components/SessionCard';
import { sessionStore } from './src/sessionStore';
import { isFirebaseConfigured } from './src/firebase';
import { normalizeCourse, seatsLeft } from './src/validation';
import { colors } from './src/theme';

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('');
  const [status, setStatus] = useState('');

  useEffect(
    () =>
      sessionStore.subscribe(setSessions, (error) =>
        setStatus(`Could not load sessions: ${error.message}`)
      ),
    []
  );

  const visible = useMemo(() => {
    const query = normalizeCourse(filter).replace(/\s/g, '');
    return sessions
      .filter((s) => s.course.replace(/\s/g, '').includes(query))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [sessions, filter]);

  const openSeats = visible.reduce((sum, s) => sum + Math.max(seatsLeft(s), 0), 0);

  async function handleCreate(session) {
    try {
      await sessionStore.create(session);
      setStatus(`Posted ${session.course} at ${session.location}.`);
      return true;
    } catch (error) {
      setStatus(`Could not post session: ${error.message}`);
      return false;
    }
  }

  async function handleJoin(sessionId, name) {
    try {
      await sessionStore.join(sessionId, name);
      setStatus(`${name} joined a session.`);
      return null;
    } catch (error) {
      return error.message;
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Study Group Finder</Text>
        <Text style={styles.subtitle}>
          Post a study session or join one that still has seats.
        </Text>

        {!isFirebaseConfigured && (
          <Text style={styles.notice}>
            Firebase is not configured, so sessions are stored in memory only.
            See README to connect Firestore.
          </Text>
        )}

        <SessionForm onSubmit={handleCreate} />

        {status ? <Text style={styles.status}>{status}</Text> : null}

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Upcoming sessions</Text>
          <Text style={styles.summary}>
            {visible.length} session{visible.length === 1 ? '' : 's'} · {openSeats} open seat
            {openSeats === 1 ? '' : 's'}
          </Text>
        </View>

        <TextInput
          style={styles.filter}
          value={filter}
          onChangeText={setFilter}
          placeholder="Filter by course, e.g. CSCE"
          placeholderTextColor={colors.muted}
          autoCapitalize="characters"
        />

        {visible.length === 0 ? (
          <Text style={styles.empty}>
            {sessions.length === 0
              ? 'No sessions yet. Be the first to post one.'
              : 'No sessions match that course.'}
          </Text>
        ) : (
          visible.map((session) => (
            <SessionCard key={session.id} session={session} onJoin={handleJoin} />
          ))
        )}
      </ScrollView>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: 20,
    paddingTop: 60,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.primary },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 4, marginBottom: 16 },
  notice: {
    backgroundColor: '#FFF4D6',
    color: '#6A4B00',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  status: {
    backgroundColor: '#EAF1FB',
    color: '#1C3F72',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  summary: { fontSize: 13, color: colors.muted },
  filter: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: colors.text,
  },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 20 },
});
