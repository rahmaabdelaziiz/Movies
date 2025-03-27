import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const API_KEY = '81b1cc283e1661e43da248d7d09aecb6';
const BASE_URL = 'https://api.themoviedb.org/3';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchMovies = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      Keyboard.dismiss();

      const response = await fetch(
        `${BASE_URL}/search/multi?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(
          query,
        )}`,
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }

      const data = await response.json();
      setResults(data.results.filter(item => item.media_type !== 'person'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchMovies();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, searchMovies]);

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        navigation.navigate('Detail', {
            itemId: item.id,
            mediaType: item.media_type
          });
      }}>
      <Image
        source={{
          uri: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : 'https://via.placeholder.com/150x220?text=No+Image',
        }}
        style={styles.poster}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title || item.name}</Text>
        <Text style={styles.details}>
          {item.media_type === 'movie' ? '🎬 Film' : '📺 Série'} •{' '}
          {item.release_date?.substring(0, 4) ||
            item.first_air_date?.substring(0, 4)}
        </Text>
        <Text style={styles.rating}>⭐ {item.vote_average?.toFixed(1)}/10</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require('../../Assets/Logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.emptyTitle}>Que cherchez-vous ?</Text>
      <Text style={styles.emptyText}>
        Recherchez des films, séries TV ou acteurs...
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher films ou séries..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          autoFocus={true}
          returnKeyType="search"
          onSubmitEditing={searchMovies}
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <FontAwesome name="times-circle" size={20} color="#888" />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#d7201b" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : results.length === 0 && query ? (
        <View style={styles.noResultsContainer}>
          <Ionicons name="sad-outline" size={50} color="#888" />
          <Text style={styles.noResultsText}>Aucun résultat trouvé</Text>
          <Text style={styles.noResultsSubText}>
            Essayez avec d'autres termes de recherche
          </Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={item => `${item.media_type}-${item.id}`}
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.listContent}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    height: 50,
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    overflow: 'hidden',
  },
  poster: {
    width: 100,
    height: 150,
  },
  infoContainer: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  details: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
  },
  rating: {
    color: '#d7201b',
    fontSize: 14,
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    color: '#d7201b',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
    tintColor: '#d7201b',
  },
  emptyTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  noResultsSubText: {
    color: '#888',
    fontSize: 14,
    marginTop: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default SearchScreen;
