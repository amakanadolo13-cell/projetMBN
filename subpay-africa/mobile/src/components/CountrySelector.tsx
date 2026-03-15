import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { BlurView } from 'expo-blur';
import { RootState } from '../store';
import { Colors } from '../theme';

interface Country {
  code: string;
  name: string;
  flag: string;
  prefix: string;
}

interface Props {
  selected: Country;
  countries: Country[];
  onSelect: (c: Country) => void;
}

export default function CountrySelector({ selected, countries, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const isDark = useSelector((s: RootState) => s.theme.mode === 'dark');
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        style={[
          styles.selector,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
          },
        ]}
        activeOpacity={0.8}
      >
        <Text style={styles.flag}>{selected.flag}</Text>
        <Text style={[styles.countryName, { color: theme.text }]}>{selected.name}</Text>
        <Text style={[styles.prefix, { color: theme.textSecondary }]}>{selected.prefix}</Text>
        <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="slide">
        <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalSheet, { backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Choisir un pays</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={countries}
              keyExtractor={(c) => c.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { onSelect(item); setIsOpen(false); }}
                  style={[
                    styles.countryItem,
                    item.code === selected.code && { backgroundColor: Colors.primary + '20' },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.itemFlag}>{item.flag}</Text>
                  <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.itemPrefix, { color: theme.textSecondary }]}>{item.prefix}</Text>
                  {item.code === selected.code && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
  },
  flag: { fontSize: 22 },
  countryName: { flex: 1, fontSize: 15, fontWeight: '600' },
  prefix: { fontSize: 14 },
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  itemFlag: { fontSize: 26 },
  itemName: { flex: 1, fontSize: 16, fontWeight: '500' },
  itemPrefix: { fontSize: 14 },
});
