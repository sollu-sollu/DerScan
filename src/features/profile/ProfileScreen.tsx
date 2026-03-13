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
import { useAuthStore } from '../../store/authStore';
import { PrimaryButton, CustomModal } from '../../components';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';
import auth from '@react-native-firebase/auth';

const ProfileScreen = () => {
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = useTheme();
  const { 
    userAvatar, 
    apiUrl, 
    setUserAvatar, 
    setApiUrl, 
    toggleDarkMode 
  } = useSettingsStore();
  const { user, reloadUser } = useAuthStore();

  const [localName, setLocalName] = useState(user?.displayName || 'User');
  const [localUrl, setLocalUrl] = useState(apiUrl);
  const [isEditing, setIsEditing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    subtitle: string;
    icon: string;
    iconColor?: string;
    actions?: any[];
  } | null>(null);

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
      });

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        const localUri = result.assets[0].uri;
        
        // Show immediate local feedback
        setUserAvatar(localUri);

        // Upload to Cloudinary for permanent storage
        const cloudUrl = await uploadImageToCloudinary(localUri);
        
        // Save to Firebase Profile
        if (auth().currentUser) {
          await auth().currentUser!.updateProfile({ photoURL: cloudUrl });
          await reloadUser();
        }
        
        setUserAvatar(cloudUrl);
      }
    } catch (error: any) {
      setModalContent({
        title: 'Upload Error',
        subtitle: error.message || 'Failed to upload profile picture.',
        icon: 'image-remove',
        iconColor: colors.error,
      });
      setModalVisible(true);
    }
  };

  const handleSave = async () => {
    try {
      if (auth().currentUser) {
        await auth().currentUser!.updateProfile({ displayName: localName });
        await reloadUser();
      }
      setApiUrl(localUrl);
      setIsEditing(false);
      setModalContent({
        title: 'Success',
        subtitle: 'Your profile has been updated successfully!',
        icon: 'check-circle-outline',
        iconColor: colors.success,
      });
      setModalVisible(true);
    } catch (e: any) {
      setModalContent({
        title: 'Update Failed',
        subtitle: e.message || 'Could not update your profile. Please try again.',
        icon: 'alert-circle-outline',
        iconColor: colors.error,
      });
      setModalVisible(true);
    }
  };

  const handleLogout = () => {
    setModalContent({
      title: 'Logout',
      subtitle: 'Are you sure you want to log out of DerScan?',
      icon: 'logout',
      iconColor: colors.error,
      actions: [
        { 
          label: 'Log Out', 
          variant: 'destructive',
          onPress: () => {
            setModalVisible(false);
            auth().signOut();
          }
        }
      ]
    });
    setModalVisible(true);
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
          {(userAvatar || user?.photoURL) ? (
            <Image source={{ uri: userAvatar || user?.photoURL || undefined }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="account" size={60} color={colors.primary} />
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarBtn} onPress={handlePickImage}>
            <Icon name="camera" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.nameText}>{user?.displayName || 'User'}</Text>
        <Text style={{ ...typography.bodySmall, color: colors.white, opacity: 0.8, marginTop: 4 }}>
          {user?.email || 'No email'}
        </Text>
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
              placeholder="http://192.168.x.x:8001"
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

      {/* Shared Custom Modal */}
      {modalContent && (
        <CustomModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={modalContent.title}
          subtitle={modalContent.subtitle}
          icon={modalContent.icon}
          iconColor={modalContent.iconColor}
          actions={modalContent.actions}
        />
      )}
    </ScrollView>
  );
};

export default ProfileScreen;
