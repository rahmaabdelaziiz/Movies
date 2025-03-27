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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const SignInScreen = () => {
  const [nomdutilisateur, setNomdutilisateur] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const handleLogin = async () => {
    if (nomdutilisateur === 'test.com' && password === '123456') {
      await AsyncStorage.setItem('userToken', 'dummy_token');
      navigation.replace('HomeNavigation');
    } else {
      Alert.alert("Nom d'utilisateur ou mot de passe incorrect");
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
            value={nomdutilisateur}
            onChangeText={setNomdutilisateur}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#B0B0B0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupText}>
              Vous n'avez pas un compte ?{''}
              <Text style={styles.signupLink}> Inscrivez-vous</Text>
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
