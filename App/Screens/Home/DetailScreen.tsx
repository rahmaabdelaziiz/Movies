import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import YoutubePlayer from 'react-native-youtube-iframe';

const API_KEY = '81b1cc283e1661e43da248d7d09aecb6';
const BASE_URL = 'https://api.themoviedb.org/3';

const DetailScreen = () => {
  const route = useRoute();
  const {itemId, mediaType} = route.params;
  const [details, setDetails] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasTrailer, setHasTrailer] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setHasTrailer(true);
        
        const detailsUrl = `${BASE_URL}/${mediaType}/${itemId}?api_key=${API_KEY}&language=fr-FR`;
        const videosUrl = `${BASE_URL}/${mediaType}/${itemId}/videos?api_key=${API_KEY}&language=fr-FR`;
        
        const [detailsResponse, videosResponse] = await Promise.all([
          fetch(detailsUrl),
          fetch(videosUrl)
        ]);

        const detailsData = await detailsResponse.json();
        const videosData = await videosResponse.json();

        setDetails(detailsData);

        const trailer = videosData.results.find(
          video => video.type === 'Trailer' && video.site === 'YouTube'
        );
        
        if (trailer) {
          setTrailer(trailer);
        } else {
          setHasTrailer(false);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [itemId, mediaType]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d7201b" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
      </View>
    );
  }

  if (!details) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri: details.backdrop_path
            ? `https://image.tmdb.org/t/p/w500${details.backdrop_path}`
            : 'https://via.placeholder.com/500x300?text=No+Image',
        }}
        style={styles.backdrop}
      />

      <View style={styles.header}>
        <Text style={styles.title}>
          {details.title || details.name}
          <Text style={styles.year}>
            {' '}
            ({details.release_date?.substring(0, 4) ||
              details.first_air_date?.substring(0, 4)})
          </Text>
        </Text>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.rating}>
            {details.vote_average?.toFixed(1)}/10
          </Text>
        </View>
      </View>

      <View style={styles.trailerContainer}>
        <Text style={styles.sectionTitle}>Bande-annonce</Text>
        {hasTrailer ? (
          trailer ? (
            <YoutubePlayer
              height={220}
              play={false}
              videoId={trailer.key}
              webViewStyle={styles.youtubePlayer}
            />
          ) : (
            <ActivityIndicator size="large" color="#d7201b" />
          )
        ) : (
          <View style={styles.noTrailerContainer}>
            <Ionicons name="videocam-off" size={50} color="#888" />
            <Text style={styles.noTrailerText}>
              {mediaType === 'movie' 
                ? "La bande-annonce n'est pas encore disponible" 
                : "La bande-annonce n'est pas encore disponible"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Synopsis</Text>
        <Text style={styles.overview}>
          {details.overview || 'Aucune description disponible.'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        
        {mediaType === 'movie' ? (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Durée:</Text>
              <Text style={styles.infoText}>
                {details.runtime ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}min` : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date sortie:</Text>
              <Text style={styles.infoText}>
                {details.release_date || 'N/A'}
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Épisodes:</Text>
              <Text style={styles.infoText}>
                {details.number_of_episodes || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Saisons:</Text>
              <Text style={styles.infoText}>
                {details.number_of_seasons || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dernière diffusion:</Text>
              <Text style={styles.infoText}>
                {details.last_air_date || 'N/A'}
              </Text>
            </View>
          </>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Genres:</Text>
          <Text style={styles.infoText}>
            {details.genres?.map(genre => genre.name).join(', ') || 'N/A'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.externalButton}
        onPress={() =>
          Linking.openURL(
            `https://www.themoviedb.org/${mediaType}/${details.id}`,
          )
        }>
        <Text style={styles.externalButtonText}>
          Voir plus sur TMDB
        </Text>
        <Ionicons name="open-outline" size={16} color="#d7201b" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  errorText: {
    color: '#d7201b',
    fontSize: 16,
    textAlign: 'center',
  },
  backdrop: {
    width: '100%',
    height: 250,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  year: {
    color: '#888',
    fontWeight: 'normal',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
  },
  section: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  overview: {
    color: '#ddd',
    fontSize: 15,
    lineHeight: 22,
  },
  trailerContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  youtubePlayer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  noTrailerContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    marginTop: 10,
  },
  noTrailerText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#d7201b',
    width: 120,
    fontWeight: 'bold',
  },
  infoText: {
    color: 'white',
    flex: 1,
  },
  externalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#1a1a1a',
    margin: 15,
    borderRadius: 8,
  },
  externalButtonText: {
    color: '#d7201b',
    fontWeight: 'bold',
    marginRight: 5,
  },
});

export default DetailScreen;