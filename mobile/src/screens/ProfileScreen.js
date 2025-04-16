import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import { isWeb } from '../utils/platform';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.headerSection}>
          {user.photo ? (
            <Image
              source={{ uri: user.photo }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>
                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <Text style={styles.profileName}>{user.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user.email || ''}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID:</Text>
            <Text style={styles.infoValue}>{user.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Signed in with:</Text>
            <Text style={styles.infoValue}>{user.provider || 'Email'}</Text>
          </View>
        </View>

        <Button
          title="Log Out"
          onPress={handleLogout}
          color="#ef4444"
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  profileContainer: {
    padding: 24,
    alignItems: 'center',
    maxWidth: isWeb ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    flex: 1,
    fontSize: 16,
    color: '#6b7280',
  },
  infoValue: {
    flex: 2,
    fontSize: 16,
    color: '#111827',
  },
  logoutButton: {
    width: '100%',
    marginTop: 16,
  },
});

export default ProfileScreen; 