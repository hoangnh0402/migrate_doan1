// Copyright (c) 2025 hqcsystem Contributors

// Licensed under the GNU General Public License v3.0 (GPL-3.0)

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService, RegisterData } from '../services/auth';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    full_name?: string;
    username?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    full_name?: boolean;
    username?: boolean;
    email?: boolean;
    phone?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  // Validation functions
  const validateFullName = (name: string): boolean => {
    return name.trim().length >= 2;
  };

  const validateUsername = (username: string): boolean => {
    // Username should be 3-30 characters, alphanumeric and underscores
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) return true; // Optional field
    // Vietnamese phone number format: 10-11 digits, may start with 0 or +84
    const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validatePasswordStrength = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 8 kÃ½ tá»±' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 1 chá»¯ hoa' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 1 chá»¯ thÆ°á»ng' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 1 sá»‘' };
    }
    return { valid: true };
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    if (field === 'full_name') {
      if (!value.trim()) {
        newErrors.full_name = 'Vui lÃ²ng nháº­p há» vÃ  tÃªn';
      } else if (!validateFullName(value)) {
        newErrors.full_name = 'Há» vÃ  tÃªn pháº£i cÃ³ Ã­t nháº¥t 2 kÃ½ tá»±';
      } else {
        delete newErrors.full_name;
      }
    } else if (field === 'username') {
      if (!value.trim()) {
        newErrors.username = 'Vui lÃ²ng nháº­p tÃªn Ä‘Äƒng nháº­p';
      } else if (!validateUsername(value)) {
        newErrors.username = 'TÃªn Ä‘Äƒng nháº­p pháº£i cÃ³ 3-30 kÃ½ tá»± (chá»¯, sá»‘, dáº¥u gáº¡ch dÆ°á»›i)';
      } else {
        delete newErrors.username;
      }
    } else if (field === 'email') {
      if (!value.trim()) {
        newErrors.email = 'Vui lÃ²ng nháº­p email';
      } else if (!validateEmail(value)) {
        newErrors.email = 'Email khÃ´ng há»£p lá»‡';
      } else {
        delete newErrors.email;
      }
    } else if (field === 'phone') {
      if (value.trim() && !validatePhone(value)) {
        newErrors.phone = 'Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡ (VD: 0912345678 hoáº·c +84912345678)';
      } else {
        delete newErrors.phone;
      }
    } else if (field === 'password') {
      if (!value.trim()) {
        newErrors.password = 'Vui lÃ²ng nháº­p máº­t kháº©u';
      } else {
        const passwordValidation = validatePasswordStrength(value);
        if (!passwordValidation.valid) {
          newErrors.password = passwordValidation.message;
        } else {
          delete newErrors.password;
        }
        // Also validate confirm password if it's been touched
        if (touched.confirmPassword && confirmPassword) {
          if (value !== confirmPassword) {
            newErrors.confirmPassword = 'Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p';
          } else {
            delete newErrors.confirmPassword;
          }
        }
      }
    } else if (field === 'confirmPassword') {
      if (!value.trim()) {
        newErrors.confirmPassword = 'Vui lÃ²ng xÃ¡c nháº­n máº­t kháº©u';
      } else if (value !== formData.password) {
        newErrors.confirmPassword = 'Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p';
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  };

  const handleFieldChange = (field: keyof RegisterData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (touched[field as keyof typeof touched]) {
      validateField(field, value);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      validateField('confirmPassword', value);
    }
    // Also re-validate password match
    if (touched.password && formData.password) {
      if (value !== formData.password) {
        setErrors({ ...errors, confirmPassword: 'Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p' });
      } else {
        const newErrors = { ...errors };
        delete newErrors.confirmPassword;
        setErrors(newErrors);
      }
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    if (field === 'confirmPassword') {
      validateField('confirmPassword', confirmPassword);
    } else {
      validateField(field, formData[field as keyof RegisterData] || '');
    }
  };

  const isFormValid = (): boolean => {
    return (
      validateFullName(formData.full_name) &&
      validateUsername(formData.username) &&
      validateEmail(formData.email) &&
      (!formData.phone || validatePhone(formData.phone)) &&
      validatePasswordStrength(formData.password).valid &&
      formData.password === confirmPassword &&
      confirmPassword.trim().length > 0
    );
  };

  const handleRegister = async () => {
    // Mark all fields as touched
    setTouched({
      full_name: true,
      username: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    // Validate all fields
    validateField('full_name', formData.full_name);
    validateField('username', formData.username);
    validateField('email', formData.email);
    validateField('phone', formData.phone);
    validateField('password', formData.password);
    validateField('confirmPassword', confirmPassword);

    if (!isFormValid()) {
      return;
    }

    setLoading(true);
    try {
      await authService.register(formData);
      Alert.alert('ThÃ nh cÃ´ng', 'ÄÃ£ Ä‘Äƒng kÃ½ thÃ nh cÃ´ng', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to login screen after alert is dismissed
            navigation.navigate('Login');
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('ÄÄƒng kÃ½ tháº¥t báº¡i', error.message || 'Vui lÃ²ng thá»­ láº¡i');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Image 
                source={require('../../assets/logo.jpg')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>ÄÄƒng kÃ½</Text>
              <Text style={styles.subtitle}>Táº¡o tÃ i khoáº£n má»›i</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, errors.full_name && styles.inputError]}>
                  <MaterialIcons name="person" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Há» vÃ  tÃªn *"
                    placeholderTextColor="#9CA3AF"
                    value={formData.full_name}
                    onChangeText={(text) => handleFieldChange('full_name', text)}
                    onBlur={() => handleBlur('full_name')}
                  />
                </View>
                {errors.full_name && touched.full_name && (
                  <Text style={styles.errorText}>{errors.full_name}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, errors.username && styles.inputError]}>
                  <MaterialIcons name="account-circle" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="TÃªn Ä‘Äƒng nháº­p *"
                    placeholderTextColor="#9CA3AF"
                    value={formData.username}
                    onChangeText={(text) => handleFieldChange('username', text)}
                    onBlur={() => handleBlur('username')}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.username && touched.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                  <MaterialIcons name="email" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email *"
                    placeholderTextColor="#9CA3AF"
                    value={formData.email}
                    onChangeText={(text) => handleFieldChange('email', text)}
                    onBlur={() => handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.email && touched.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                  <MaterialIcons name="phone" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Sá»‘ Ä‘iá»‡n thoáº¡i (tÃ¹y chá»n)"
                    placeholderTextColor="#9CA3AF"
                    value={formData.phone}
                    onChangeText={(text) => handleFieldChange('phone', text)}
                    onBlur={() => handleBlur('phone')}
                    keyboardType="phone-pad"
                  />
                </View>
                {errors.phone && touched.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                  <MaterialIcons name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Máº­t kháº©u *"
                    placeholderTextColor="#9CA3AF"
                    value={formData.password}
                    onChangeText={(text) => handleFieldChange('password', text)}
                    onBlur={() => handleBlur('password')}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <MaterialIcons
                      name={showPassword ? 'visibility' : 'visibility-off'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && touched.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                  <MaterialIcons name="lock-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="XÃ¡c nháº­n máº­t kháº©u *"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <MaterialIcons
                      name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && touched.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.registerButton,
                  (loading || !isFormValid()) && styles.registerButtonDisabled
                ]}
                onPress={handleRegister}
                disabled={loading || !isFormValid()}
              >
                {loading ? (
                  <ActivityIndicator color="#20A957" />
                ) : (
                  <Text style={styles.registerButtonText}>ÄÄƒng kÃ½</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>ÄÃ£ cÃ³ tÃ i khoáº£n? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>ÄÄƒng nháº­p</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#20A957',
    marginTop: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    opacity: 0.9,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  eyeIcon: {
    padding: 4,
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#20A957',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#20A957',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#20A957',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default RegisterScreen;



