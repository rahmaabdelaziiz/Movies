import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPopularMovies, fetchTopRatedMovies, incrementPage } from '../../Redux/moviesSlice';

const MOVIES_PER_PAGE = 10;

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const {
    popular,
    topRated,
    currentPage,
    totalPages,
    loading,
    error,
  } = useSelector((state) => state.movies);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isLoadingMore = useSelector((state) => state.movies.loading && currentPage > 1);
  useEffect(() => {
    dispatch(fetchPopularMovies(1));
    dispatch(fetchTopRatedMovies());
  }, [dispatch]);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchPopularMovies(1))
      .finally(() => setRefreshing(false));
    dispatch(fetchTopRatedMovies());
  };

  const loadMoreMovies = () => {
    if (currentPage >= totalPages) return;
    dispatch(incrementPage());
    dispatch(fetchPopularMovies(currentPage + 1));
  };
  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setIsModalVisible(false));
  };
  const renderMovieItem = useCallback(
    ({item}) => (
      <TouchableOpacity
        style={styles.movieContainer}
        onPress={() => navigation.navigate('Detail', {
          itemId: item.id,
          mediaType: 'movie'
        })}>
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
        onPress={() => navigation.navigate('Detail', {
          itemId: item.id,
          mediaType: 'movie'
        })}
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
        {isLoadingMore ? (
          <ActivityIndicator size="large" color="#d7201b" />
        ) : (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={loadMoreMovies}>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [currentPage, totalPages, isLoadingMore, loadMoreMovies]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>MOVIES</Text>
        <Image source={require('../../Assets/Logo.png')} style={styles.logo} />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#d7201b" style={styles.loader} />
      ) : (
        <FlatList
          ListHeaderComponent={
            <>
              <Text style={styles.sectionTitle}>⭐ Top 5 des Films</Text>
              <FlatList
                data={topRated.slice(0, 5)}
                renderItem={renderTopMovieItem}
                keyExtractor={item => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.topMoviesList}
              />
              <Text style={styles.sectionTitle}>🔥 Films Populaires</Text>
            </>
          }
          data={popular.slice(0, currentPage * MOVIES_PER_PAGE)}
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
          onEndReached={loadMoreMovies}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            currentPage < totalPages ? (
              <View style={styles.footerContainer}>
                <ActivityIndicator size="large" color="#d7201b" />
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <Animated.View
            style={[
              styles.modalContent,
              styles.modalBackdrop,
              {
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}>
            <Image
              source={{
                uri: selectedMovie?.poster_path
                  ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`
                  : 'https://via.placeholder.com/300x450?text=No+Image',
              }}
              style={styles.modalImage}
            />
            <Text style={styles.modalTitle}>{selectedMovie?.title}</Text>

            <View style={styles.movieDetails}>
              <Text style={styles.detailText}>
                ⭐ {selectedMovie?.vote_average?.toFixed(1)}/10
              </Text>
              <Text style={styles.detailText}>
                📅 {selectedMovie?.release_date?.split('-')[0]}
              </Text>
            </View>

            <View style={styles.synopsisContainer}>
              <Text style={styles.sectionTitleModal}>Synopsis</Text>
              {selectedMovie?.overview ? (
                <Text style={styles.modalOverview}>
                  {selectedMovie.overview}
                </Text>
              ) : (
                <View style={styles.noOverviewContainer}>
                  <Ionicons name="document-text-outline" size={30} color="#888" />
                  <Text style={styles.noOverviewText}>
                    Synopsis non disponible
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.trailerSection}>
              <Text style={styles.sectionTitleModal}>Bande-annonce</Text>
              <View style={styles.trailerPlaceholder}>
                <Ionicons name="videocam-off" size={40} color="#888" />
                <Text style={styles.noTrailerText}>
                  Bande-annonce non disponible
                </Text>
                <Text style={styles.trailerHelpText}>
                  Revenez plus tard ou consultez TMDB
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.tmdbButton}
              onPress={() => Linking.openURL(`https://www.themoviedb.org/movie/${selectedMovie?.id}`)}>
              <Text style={styles.tmdbButtonText}>Voir sur TMDB</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    logo: {
        width: 40,
        height: 40,
        marginRight: 15,
        tintColor: '#d7201b',
      },
    
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
  },
  appTitle: {
    color: '#d7201b',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  errorText: {
    color: '#d7201b',
    textAlign: 'center',
    margin: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
    marginHorizontal: 5,
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
    // backgroundColor: '#d7201b',
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
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  movieDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  detailText: {
    color: '#fff',
    fontSize: 16,
  },
  synopsisContainer: {
    marginBottom: 20,
  },
  sectionTitleModal: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalOverview: {
    color: '#ddd',
    fontSize: 15,
    lineHeight: 22,
  },
  noOverviewContainer: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  noOverviewText: {
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  trailerSection: {
    marginBottom: 20,
  },
  trailerPlaceholder: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
  },
  noTrailerText: {
    color: '#888',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  trailerHelpText: {
    color: '#555',
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
  },
  tmdbButton: {
    backgroundColor: '#01b4e4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  tmdbButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#d7201b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    lineHeight: 28,
  },
});

export default HomeScreen;