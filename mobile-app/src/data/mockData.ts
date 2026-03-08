// ============================================================
// Mock data — fallback when API is unavailable
// ============================================================
import type { Song, Movie } from "@/types/music";

export const mockSongs: Song[] = [
  {
    id: "s1", title: "Chinna Chinna Aasai",
    artist: "A.R. Rahman, Minmini", movie: "Roja", movieSlug: "roja", year: 1992,
    duration: 312, imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  },
  {
    id: "s2", title: "Why This Kolaveri Di",
    artist: "Dhanush, Anirudh", movie: "3", movieSlug: "3-movie", year: 2012,
    duration: 234, imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
  },
  {
    id: "s3", title: "Vaathi Coming",
    artist: "Anirudh Ravichander", movie: "Master", movieSlug: "master", year: 2021,
    duration: 198, imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
  },
  {
    id: "s4", title: "Enna Solla",
    artist: "Anirudh, Khushbu Sundar", movie: "Thanga Magan", movieSlug: "thanga-magan", year: 2015,
    duration: 267, imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop",
  },
  {
    id: "s5", title: "Kannazhaga",
    artist: "Dhanush, Shruti Haasan", movie: "3", movieSlug: "3-movie", year: 2012,
    duration: 289, imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
  },
  {
    id: "s6", title: "Rowdy Baby",
    artist: "Dhanush, Dhee", movie: "Maari 2", movieSlug: "maari-2", year: 2018,
    duration: 245, imageUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop",
  },
  {
    id: "s7", title: "Aalaporan Thamizhan",
    artist: "A.R. Rahman, Kailash Kher", movie: "Mersal", movieSlug: "mersal", year: 2017,
    duration: 328, imageUrl: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=400&h=400&fit=crop",
  },
  {
    id: "s8", title: "Nenjame",
    artist: "Anirudh Ravichander", movie: "Vikram", movieSlug: "vikram", year: 2022,
    duration: 203, imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop",
  },
  {
    id: "s9", title: "Arabic Kuthu",
    artist: "Anirudh, Jonita Gandhi", movie: "Beast", movieSlug: "beast", year: 2022,
    duration: 256, imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  },
  {
    id: "s10", title: "Kutti Story",
    artist: "Thalapathy Vijay, Anirudh", movie: "Master", movieSlug: "master", year: 2021,
    duration: 218, imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
  },
];

export const mockMovies: Movie[] = [
  { slug: "roja", title: "Roja", year: 1992, imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop", songCount: 6 },
  { slug: "3-movie", title: "3", year: 2012, imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop", songCount: 5 },
  { slug: "master", title: "Master", year: 2021, imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop", songCount: 5 },
  { slug: "vikram", title: "Vikram", year: 2022, imageUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop", songCount: 8 },
  { slug: "beast", title: "Beast", year: 2022, imageUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop", songCount: 5 },
  { slug: "maari-2", title: "Maari 2", year: 2018, imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop", songCount: 6 },
  { slug: "mersal", title: "Mersal", year: 2017, imageUrl: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=400&h=400&fit=crop", songCount: 7 },
  { slug: "thanga-magan", title: "Thanga Magan", year: 2015, imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop", songCount: 5 },
];
