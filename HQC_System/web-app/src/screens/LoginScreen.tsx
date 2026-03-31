// Copyright (c) 2025 HQC System Contributors

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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

// Web-specific form wrapper to fix password field warning
const FormWrapper: React.FC<{ children: React.ReactNode; onSubmit: () => void }> = ({ children, onSubmit }) => {
  if (Platform.OS === 'web') {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        style={{ width: '100%' }}
      >
        {children}
      </form>
    );
  }
  return <>{children}</>;
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ username?: boolean; password?: boolean }>({});

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string): boolean => {
    // Username should be at least 3 characters, alphanumeric and underscores
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    return usernameRegex.test(username);
  };

  const validateUsernameOrEmail = (value: string): boolean => {
    if (!value.trim()) return false;
    // Check if it's an email or username
    if (value.includes('@')) {
      return validateEmail(value);
    }
    return validateUsername(value);
  };

  const validatePassword = (password: string): boolean => {
    return password.trim().length >= 6;
  };

  const validateField = (field: 'username' | 'password', value: string) => {
    const newErrors = { ...errors };
    
    if (field === 'username') {
      if (!value.trim()) {
        newErrors.username = 'Vui lÃ²ng nháº­p tÃªn Ä‘Äƒng nháº­p hoáº·c email';
      } else if (!validateUsernameOrEmail(value)) {
        if (value.includes('@')) {
          newErrors.username = 'Email khÃ´ng há»£p lá»‡';
        } else {
          newErrors.username = 'TÃªn Ä‘Äƒng nháº­p pháº£i cÃ³ Ã­t nháº¥t 3 kÃ½ tá»± (chá»¯, sá»‘, dáº¥u gáº¡ch dÆ°á»›i)';
        }
      } else {
        delete newErrors.username;
      }
    } else if (field === 'password') {
      if (!value.trim()) {
        newErrors.password = 'Vui lÃ²ng nháº­p máº­t kháº©u';
      } else if (!validatePassword(value)) {
        newErrors.password = 'Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±';
      } else {
        delete newErrors.password;
      }
    }
    
    setErrors(newErrors);
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (touched.username) {
      validateField('username', text);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (touched.password) {
      validateField('password', text);
    }
  };

  const handleBlur = (field: 'username' | 'password') => {
    setTouched({ ...touched, [field]: true });
    validateField(field, field === 'username' ? username : password);
  };

  const isFormValid = (): boolean => {
    return validateUsernameOrEmail(username) && validatePassword(password);
  };

  const handleLogin = async () => {
    // Mark all fields as touched
    setTouched({ username: true, password: true });
    
    // Validate all fields
    validateField('username', username);
    validateField('password', password);

    if (!isFormValid()) {
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      // Navigation will be handled by RootNavigator based on auth state
    } catch (error: any) {
      Alert.alert('ÄÄƒng nháº­p tháº¥t báº¡i', error.message || 'Vui lÃ²ng kiá»ƒm tra láº¡i thÃ´ng tin');
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
            </View>

            <FormWrapper onSubmit={handleLogin}>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <View style={[styles.inputContainer, errors.username && styles.inputError]}>
                    <MaterialIcons name="person" size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="TÃªn Ä‘Äƒng nháº­p hoáº·c email"
                      placeholderTextColor="#9CA3AF"
                      value={username}
                      onChangeText={handleUsernameChange}
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
                  <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                    <MaterialIcons name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Máº­t kháº©u"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={handlePasswordChange}
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

                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={styles.forgotPassword}
                >
                  <Text style={styles.forgotPasswordText}>QuÃªn máº­t kháº©u?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    (loading || !isFormValid()) && styles.loginButtonDisabled
                  ]}
                  onPress={handleLogin}
                  disabled={loading || !isFormValid()}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginButtonText}>ÄÄƒng nháº­p</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>ChÆ°a cÃ³ tÃ i khoáº£n? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerLink}>ÄÄƒng kÃ½</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </FormWrapper>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#20A957',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#20A957',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#20A957',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  registerLink: {
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

export default LoginScreen;



