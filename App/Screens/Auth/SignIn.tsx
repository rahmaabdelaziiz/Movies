import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth';
import {app} from './FirebaseConfig';

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const auth = getAuth(app);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (userCredential?.user) {
        await AsyncStorage.setItem('userToken', userCredential.user.uid);
        navigation.replace('HomeNavigation');
      }
    } catch (error: any) {
      console.log('Erreur complète:', error);

      let errorMessage = "Une erreur s'est produite lors de la connexion";

      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/wrong-password':
            errorMessage = 'Email ou mot de passe incorrect';
            break;
          case 'auth/user-not-found':
            errorMessage = 'Aucun compte trouvé avec cet email';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Ce compte a été désactivé';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Trop de tentatives. Réessayez plus tard';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }

      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#d7201b', '#000000']} style={styles.background}>
      <View style={styles.container}>
        <Image source={require('../../Assets/Logo.png')} style={styles.logo} />

        <View style={styles.form}>
          <Text style={styles.title}>Connectez-vous à Movies</Text>

          <TextInput
            style={styles.input}
            placeholder="Adresse e-mail"
            placeholderTextColor="#B0B0B0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#B0B0B0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupText}>
              Vous n'avez pas de compte ?{' '}
              <Text style={styles.signupLink}>Inscrivez-vous</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  form: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  forgotPassword: {
    fontSize: 14,
    color: '#d7201b',
    marginBottom: 10,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#d7201b',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupText: {
    marginTop: 15,
    fontSize: 14,
    color: '#555',
  },
  signupLink: {
    color: '#d7201b',
    fontWeight: 'bold',
  },
});

export default SignInScreen;
