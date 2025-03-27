import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';

const API_KEY = '81b1cc283e1661e43da248d7d09aecb6';
const BASE_URL = 'https://api.themoviedb.org/3';
const MOVIES_PER_PAGE = 10;

const HomeScreen = ({navigation}) => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchMovies = useCallback(async (type, page = 1) => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/${type}?api_key=${API_KEY}&language=fr-FR&page=${page}`,
      );

      if (!response.ok)
        throw new Error(`Erreur HTTP! statut: ${response.status}`);

      const data = await response.json();
      if (!data.results) throw new Error('Format de données inattendu');

      return {
        results: data.results,
        totalPages: data.total_pages,
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération des films ${type}:`, error);
      throw error;
    }
  }, []);

  const fetchAllMovies = useCallback(async () => {
    try {
      setLoading(true);
      const [popular, topRated] = await Promise.all([
        fetchMovies('popular'),
        fetchMovies('top_rated'),
      ]);

      setPopularMovies(popular.results.slice(0, MOVIES_PER_PAGE));
      setTopRatedMovies(topRated.results);
      setTotalPages(popular.totalPages);
      setCurrentPage(1);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchMovies]);

  const loadMoreMovies = useCallback(async () => {
    if (isLoadingMore || currentPage >= totalPages) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const response = await fetchMovies('popular', nextPage);

      setPopularMovies(prev => [
        ...prev,
        ...response.results.slice(0, MOVIES_PER_PAGE),
      ]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Erreur lors du chargement supplémentaire:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, totalPages, isLoadingMore, fetchMovies]);
  useEffect(() => {
    fetchAllMovies();
  }, [fetchAllMovies]);

  const handleError = error => {
    console.error('Erreur:', error);
    Alert.alert(
      'Erreur',
      'Impossible de charger les films. Veuillez réessayer plus tard.',
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllMovies();
  };

  const renderMovieItem = useCallback(
    ({item}) => (
      <TouchableOpacity
        style={styles.movieContainer}
        onPress={() => navigation.navigate('Details', {movieId: item.id})}>
        <Image
          source={{
            uri: item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : 'https://via.placeholder.com/150x220?text=No+Image',
          }}
          style={styles.movieImage}
          resizeMode="cover"
        />
        <Text style={styles.movieTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.movieRating}>
          ⭐ {item.vote_average?.toFixed(1)}
        </Text>
      </TouchableOpacity>
    ),
    [navigation],
  );

  const renderTopMovieItem = useCallback(
    ({item}) => (
      <TouchableOpacity
        style={styles.topMovieContainer}
        onPress={() => navigation.navigate('Details', {movieId: item.id})}
        activeOpacity={0.7}>
        <View style={styles.topMovieImageContainer}>
          <Image
            source={{
              uri: item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : 'https://via.placeholder.com/200x300?text=No+Image',
            }}
            style={styles.topMovieImage}
          />
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              ⭐ {item.vote_average?.toFixed(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.topMovieTitle} numberOfLines={1}>
          {item.title}
        </Text>
      </TouchableOpacity>
    ),
    [navigation],
  );

  const ListFooterComponent = useCallback(() => {
    if (currentPage >= totalPages) return null;

    return (
      <View style={styles.footerContainer}>
        {loadingMore ? (
          <ActivityIndicator size="small" color="#d7201b" />
        ) : (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={loadMoreMovies}>
            <Text style={styles.loadMoreText}>Voir plus de films</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [currentPage, totalPages, loadingMore, loadMoreMovies]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>MOVIES</Text>
        <Image source={require('../../Assets/Logo.png')} style={styles.logo} />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#d7201b" style={styles.loader} />
      ) : (
        <FlatList
          ListHeaderComponent={
            <>
              <Text style={styles.sectionTitle}>⭐ Top 5 des Films</Text>
              <FlatList
                data={topRatedMovies.slice(0, 5)}
                renderItem={renderTopMovieItem}
                keyExtractor={item => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.topMoviesList}
              />
              <Text style={styles.sectionTitle}>🔥 Films Populaires</Text>
            </>
          }
          data={popularMovies}
          renderItem={renderMovieItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#d7201b']}
              tintColor="#d7201b"
            />
          }
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator
                size="large"
                color="#d7201b"
                style={styles.loadingMoreIndicator}
              />
            ) : null
          }
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMoreMovies}
          onEndReachedThreshold={0.2}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
    marginHorizontal: 5,
  },

  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingMoreIndicator: {
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#d7201b',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 15,
    tintColor: '#FFF',
  },
  appTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
  },
  topMoviesList: {
    paddingLeft: 15,
    paddingBottom: 20,
  },
  topMovieContainer: {
    width: 150,
    marginRight: 15,
    alignItems: 'center',
  },
  topMovieImageContainer: {
    width: 150,
    height: 220,
    borderRadius: 15,
    shadowColor: '#d7201b',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    position: 'relative',
  },
  topMovieImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    resizeMode: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d7201b',
  },
  ratingText: {
    color: '#d7201b',
    fontSize: 12,
    fontWeight: 'bold',
  },
  topMovieTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    width: '100%',
  },
  movieContainer: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
    maxWidth: '50%',
  },
  movieImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    backgroundColor: '#333',
  },
  movieTitle: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
    width: '100%',
  },
  movieRating: {
    color: '#d7201b',
    fontSize: 12,
    marginTop: 3,
  },
  loadMoreButton: {
    padding: 15,
    backgroundColor: '#d7201b',
    borderRadius: 8,
    alignItems: 'center',
    margin: 10,
    marginTop: 20,
  },
  loadMoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
});

export default HomeScreen;
