import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { formatTime, normalizeName, seatsLeft } from '../validation';
import { colors } from '../theme';

export default function SessionCard({ session, onJoin }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const left = seatsLeft(session);
  const full = left <= 0;

  async function handleJoin() {
    const trimmed = normalizeName(name);
    if (!trimmed) {
      setError('Enter your name to join.');
      return;
    }
    const message = await onJoin(session.id, trimmed);
    setError(message ?? '');
    if (!message) setName('');
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.course}>{session.course}</Text>
        <Text style={[styles.badge, full ? styles.badgeFull : styles.badgeOpen]}>
          {full ? 'Full' : `${left} seat${left === 1 ? '' : 's'} left`}
        </Text>
      </View>
      <Text style={styles.meta}>
        {formatTime(session.time)} · {session.location}
      </Text>
      <Text style={styles.meta}>Hosted by {session.host}</Text>
      <Text style={styles.attendees}>
        Going ({session.attendees.length}/{session.seats}): {session.attendees.join(', ')}
      </Text>

      {!full && (
        <View style={styles.joinRow}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.muted}
          />
          <Pressable accessibilityRole="button" style={styles.button} onPress={handleJoin}>
            <Text style={styles.buttonText}>Join</Text>
          </Pressable>
        </View>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  course: { fontSize: 17, fontWeight: '700', color: colors.text },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  badgeOpen: { backgroundColor: '#E3F4E8', color: colors.success },
  badgeFull: { backgroundColor: '#FBE4E4', color: colors.danger },
  meta: { fontSize: 13, color: colors.muted, marginBottom: 2 },
  attendees: { fontSize: 13, color: colors.text, marginTop: 6 },
  joinRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { color: colors.danger, fontSize: 12, marginTop: 6 },
});
