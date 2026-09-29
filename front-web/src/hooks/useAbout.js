import { useAsyncResource } from './useAsyncResource.js';
import { aboutApi } from '../api/about.js';
import { mapAboutLike } from '../services/adapters.js';

export const EMPTY_ABOUT = {
  headline: '',
  about: '',
  contact: '',
  skills: '',
  educations: [],
  experiences: [],
  images: [],
};

/**
 * Loads the profile once and normalises it for the components that read it.
 * Shared by the home page and the About, Skills, and Contact pages.
 */
export default function useAbout() {
  const { data, loading, error } = useAsyncResource(
    () => aboutApi.get().then((r) => r.about),
    [],
  );

  return {
    aboutMe: data ? mapAboutLike(data) : EMPTY_ABOUT,
    loading,
    error,
  };
}
