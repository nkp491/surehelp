import { commonTranslations } from './common';
import { formTranslations } from './form';
import { medicalConditionsTranslations } from './medical';

export const translations = {
  en: {
    ...commonTranslations.en,
    ...formTranslations.en,
  },
  es: {
    ...commonTranslations.es,
    ...formTranslations.es,
  }
};

export { medicalConditionsTranslations };