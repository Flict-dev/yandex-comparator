import { z } from "zod";

export const playlistUrlSchema = z
  .string()
  .trim()
  .url({ message: "Введите корректный URL" });

export const playlistsSchema = z
  .array(playlistUrlSchema)
  .min(2, "Нужно минимум 2 ссылки");

export const likelyYandexPlaylist = (value: string) => {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("music.yandex") &&
    (normalized.includes("/users/") || normalized.includes("/playlists/"))
  );
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export const validatePlaylistUrl = (value: string): ValidationResult => {
  const result = playlistUrlSchema.safeParse(value);
  if (result.success) {
    return { isValid: true, errors: [] };
  }

  return {
    isValid: false,
    errors: result.error.errors.map((error) => error.message),
  };
};
