import 'server-only';

const dictionaries = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  ro: () => import('../dictionaries/ro.json').then((module) => module.default),
  ru: () => import('../dictionaries/ru.json').then((module) => module.default),
};

export const getDictionary = async (locale: 'en' | 'ro' | 'ru') => dictionaries[locale]();
