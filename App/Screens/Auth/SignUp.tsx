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
import {getAuth, createUserWithEmailAndPassword} from 'firebase/auth';
import {doc, setDoc, getFirestore} from 'firebase/firestore';
import {app} from './FirebaseConfig';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const auth = getAuth(app);
  const db = getFirestore(app);

  const handleSignUp = async () => {
    if (!email || !name || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Erreur',
        'Le mot de passe doit contenir au moins 6 caractères',
      );
      return;
    }

    try {
      setLoading(true);
      console.log('Tentative de création de compte...');

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      console.log(
        'Utilisateur créé, enregistrement des données supplémentaires...',
      );

      try {
        await Promise.race([
          setDoc(doc(db, 'users', userCredential.user.uid), {
            name: name,
            email: email,
            createdAt: new Date(),
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout Firestore')), 5000),
          ),
        ]);
      } catch (firestoreError) {
        console.warn('Erreur Firestore (non critique):', firestoreError);
      }

      console.log('Navigation vers Home...');
      navigation.replace('HomeNavigation');
    } catch (error) {
      console.error('Erreur complète:', error);
      let errorMessage = "Une erreur s'est produite";

      if (error instanceof Error) {
        switch (error.message) {
          case 'Timeout Firestore':
            errorMessage = 'Le serveur a mis trop de temps à répondre';
            break;
          default:
            errorMessage = error.message;
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
          <Text style={styles.title}>Créez votre compte Movies</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#B0B0B0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Nom complet"
            placeholderTextColor="#B0B0B0"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe (6 caractères min)"
            placeholderTextColor="#B0B0B0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            placeholderTextColor="#B0B0B0"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignUp}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.loginText}>
              Vous avez déjà un compte?{' '}
              <Text style={styles.loginLink}>Connectez-vous</Text>
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
  privacyText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  link: {
    color: '#d7201b',
    fontWeight: 'bold',
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
  loginText: {
    marginTop: 15,
    fontSize: 14,
    color: '#555',
  },
  loginLink: {
    color: '#d7201b',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
