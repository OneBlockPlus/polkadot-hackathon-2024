export interface UnsplashImage {
  id: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
}
