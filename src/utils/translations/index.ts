
import { commonTranslations } from './common';
import { formTranslations } from './form';
import { medicalConditionsTranslations } from './medical';
import { profileTranslations } from './profile';

export const translations = {
  en: {
    ...commonTranslations.en,
    ...formTranslations.en,
    ...profileTranslations.en,
  },
  es: {
    ...commonTranslations.es,
    ...formTranslations.es,
    ...profileTranslations.es,
  }
};

export { medicalConditionsTranslations };
