import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../theme';
import { useSettingsStore } from '../../store/settingsStore';
import { PrimaryButton } from '../../components/PrimaryButton';

const ProfileScreen = () => {
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = useTheme();
  const { 
    userName, 
    userAvatar, 
    apiUrl, 
    setUserName, 
    setUserAvatar, 
    setApiUrl, 
    toggleDarkMode 
  } = useSettingsStore();

  const [localName, setLocalName] = useState(userName);
  const [localUrl, setLocalUrl] = useState(apiUrl);
  const [isEditing, setIsEditing] = useState(false);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (result.assets && result.assets.length > 0) {
      setUserAvatar(result.assets[0].uri || null);
    }
  };

  const handleSave = () => {
    setUserName(localName);
    setApiUrl(localUrl);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout? (Mock)', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout pressed') },
    ]);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: spacing.lg,
      paddingTop: spacing.xl * 2,
      backgroundColor: colors.primary,
      alignItems: 'center',
      borderBottomLeftRadius: borderRadius.xl * 2,
      borderBottomRightRadius: borderRadius.xl * 2,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: spacing.md,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.surface,
      borderWidth: 4,
      borderColor: colors.white,
    },
    avatarPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: colors.white,
    },
    editAvatarBtn: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      backgroundColor: colors.secondary,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.sm,
    },
    nameText: {
      ...typography.h2,
      color: colors.white,
      marginBottom: spacing.xs,
    },
    content: {
      padding: spacing.lg,
      paddingTop: spacing.xl,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      ...typography.caption,
      color: colors.textLight,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: spacing.sm,
      marginLeft: spacing.xs,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
    },
    labelPair: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    label: {
      ...typography.body,
      color: colors.text,
      fontWeight: '600',
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginTop: spacing.sm,
      color: colors.text,
      ...typography.body,
    },
    saveBtn: {
      marginTop: spacing.lg,
    },
    logoutBtn: {
      marginTop: spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.md,
    },
    logoutText: {
      ...typography.body,
      color: colors.error,
      fontWeight: '600',
      marginLeft: spacing.sm,
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="account" size={60} color={colors.primary} />
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarBtn} onPress={handlePickImage}>
            <Icon name="camera" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.nameText}>{userName}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.labelPair}>
                <View style={styles.iconBox}>
                  <Icon name="pencil-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.label}>Profile Name</Text>
              </View>
            </View>
            <TextInput
              style={styles.input}
              value={localName}
              onChangeText={setLocalName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textLight}
              onFocus={() => setIsEditing(true)}
            />

            <View style={[styles.row, { marginTop: spacing.lg }]}>
              <View style={styles.labelPair}>
                <View style={styles.iconBox}>
                  <Icon name="api" size={20} color={colors.primary} />
                </View>
                <Text style={styles.label}>Backend API URL</Text>
              </View>
            </View>
            <TextInput
              style={styles.input}
              value={localUrl}
              onChangeText={setLocalUrl}
              placeholder="http://192.168.x.x:8000"
              placeholderTextColor={colors.textLight}
              onFocus={() => setIsEditing(true)}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {isEditing && (
              <View style={styles.saveBtn}>
                <PrimaryButton title="Save Changes" onPress={handleSave} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.labelPair}>
                <View style={styles.iconBox}>
                  <Icon 
                    name={isDarkMode ? "weather-night" : "weather-sunny"} 
                    size={20} 
                    color={colors.primary} 
                  />
                </View>
                <Text style={styles.label}>Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={(val) => toggleDarkMode(val)}
                trackColor={{ false: colors.border, true: colors.secondary }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="logout" size={24} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
