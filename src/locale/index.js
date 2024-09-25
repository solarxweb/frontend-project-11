import i18next from 'i18next';
import ru from './ru.js';

const i18n = () => {
  const i18instance = i18next.createInstance();

  i18instance.init({
    lng: 'ru',
    debug: true,
    resouces: {
      ru,
    },
  });
};

export default i18n;
