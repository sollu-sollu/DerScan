import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { CustomModal } from '../../components';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuthStore } from '../../store/authStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SignUpScreen() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { reloadUser } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    subtitle: string;
    icon: string;
    iconColor?: string;
  } | null>(null);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setModalContent({
        title: 'Missing Fields',
        subtitle: 'Please fill in all fields to create your account.',
        icon: 'alert-circle-outline',
        iconColor: colors.warning,
      });
      setModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      // Update display name
      await userCredential.user.updateProfile({ displayName: name });
      // Reload to ensure state reflects the new name immediately
      await reloadUser();
    } catch (error: any) {
      console.error(error);
      setModalContent({
        title: 'Registration Failed',
        subtitle: error.message || 'Could not create your account at this time.',
        icon: 'account-plus-outline',
        iconColor: colors.error,
      });
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center' },
    header: { marginBottom: spacing.xxl },
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
    subtitle: { ...typography.body, color: colors.textSecondary },
    inputContainer: { marginBottom: spacing.lg },
    label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm, fontWeight: '600' },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      height: 52,
    },
    inputIcon: { marginRight: spacing.sm },
    input: { flex: 1, color: colors.text, ...typography.body },
    eyeIcon: { padding: spacing.sm },
    signupBtn: {
      backgroundColor: colors.primary,
      height: 52,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xl,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    signupBtnText: { ...typography.body, fontWeight: 'bold', color: '#FFF' },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.xl,
    },
    footerText: { ...typography.body, color: colors.textSecondary },
    footerLink: { ...typography.body, color: colors.primary, fontWeight: 'bold', marginLeft: 4 },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join DerScan to track your skin health</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>FULL NAME</Text>
            <View style={styles.inputWrapper}>
              <Icon name="account-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={colors.textLight}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>EMAIL</Text>
            <View style={styles.inputWrapper}>
              <Icon name="email-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Icon name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.signupBtn} onPress={handleSignUp} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.signupBtnText}>Sign Up</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Shared Custom Modal */}
      {modalContent && (
        <CustomModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={modalContent.title}
          subtitle={modalContent.subtitle}
          icon={modalContent.icon}
          iconColor={modalContent.iconColor}
        />
      )}
    </SafeAreaView>
  );
}
