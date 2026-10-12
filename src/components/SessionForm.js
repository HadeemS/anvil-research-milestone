import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  normalizeCourse,
  normalizeName,
  normalizeTime,
  validateSession,
} from '../validation';
import { colors } from '../theme';

export const LOCATIONS = [
  'Thomas Cooper Library',
  'Russell House',
  'Molinaroli College of Engineering and Computing',
];

const EMPTY_FORM = { host: '', course: '', location: '', time: '', seats: '4' };

function Field({ label, error, ...inputProps }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={colors.muted}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export default function SessionForm({ onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit() {
    const found = validateSession(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const ok = await onSubmit({
      host: normalizeName(form.host),
      course: normalizeCourse(form.course),
      location: form.location,
      time: normalizeTime(form.time),
      seats: Number(form.seats),
    });
    setSubmitting(false);
    if (ok) setForm({ ...EMPTY_FORM, host: form.host });
  }

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Host a study session</Text>

      <Field
        label="Your name"
        value={form.host}
        onChangeText={update('host')}
        placeholder="Hadeem"
        error={errors.host}
      />
      <Field
        label="Course"
        value={form.course}
        onChangeText={update('course')}
        placeholder="CSCE 490"
        autoCapitalize="characters"
        error={errors.course}
      />

      <Text style={styles.label}>Location</Text>
      <View style={styles.chips}>
        {LOCATIONS.map((location) => {
          const selected = form.location === location;
          return (
            <Pressable
              key={location}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => update('location')(location)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {location}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {errors.location ? (
        <Text style={[styles.error, styles.locationError]}>{errors.location}</Text>
      ) : null}

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Field
            label="Start time"
            value={form.time}
            onChangeText={update('time')}
            placeholder="14:30"
            error={errors.time}
          />
        </View>
        <View style={styles.rowItem}>
          <Field
            label="Seats"
            value={form.seats}
            onChangeText={update('seats')}
            keyboardType="number-pad"
            error={errors.seats}
          />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={handleSubmit}
        disabled={submitting}
        style={[styles.button, submitting && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>
          {submitting ? 'Posting...' : 'Post session'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heading: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: colors.text },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 4, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#fff',
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
  locationError: { marginTop: -8, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.text },
  chipTextSelected: { color: '#fff' },
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
