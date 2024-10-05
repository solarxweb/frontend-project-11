import * as yup from 'yup';
import i18next from 'i18next';
import state from './state.js';
import ru from './locale/ru.js';
import {
  pageElements, renderErrors, renderStaticElements, renderFeed,
  makeRead, showModal, updateFormAndBtn,
} from './view.js';
import fetchFeed from './fetch.js';
import parseFeed from './parser.js';

const checkNewPosts = () => {
  /* eslint-disable prefer-destructuring */
  const body = pageElements.body;
  /* eslint-enable prefer-destructuring */

  const promises = state.subscribes.map((feedUrl) => fetchFeed(feedUrl)
    .then((data) => parseFeed(data.contents))
    .then((result) => {
      console.log(result);
      const { fTitle, fDescription, posts } = result;
      const existingNames = new Set(state.feeds.posts.map(({ title }) => title));
      const newPosts = posts.filter((post) => !existingNames.has(post.title));

      if (!body.classList.contains('modal-open') && newPosts.length > 0) {
        state.feeds.posts.push(...newPosts.map((post) => ({
          ...post,
          read: false,
        })));

        renderFeed(state, {
          feedTitle: fTitle,
          feedDescription: fDescription,
          posts: newPosts,
        });
      }
    })
    .catch((error) => {
      console.error(`Ошибка при проверке постов в потоке ${feedUrl}:`, error);
    }));
  Promise.all(promises)
    .catch((error) => {
      console.error('Ошибка при получении постов:', error);
    })
    .finally(() => {
      setTimeout(checkNewPosts, 5000);
    });
};

const app = () => {
  const {
    form, input, button, label, title, subtitle, postsContainer,
  } = pageElements;
  input.focus();

  const i18instance = i18next.createInstance();
  i18instance.init({
    lng: state.defLang,
    debug: true,
    resources: {
      ru,
    },
  });

  yup.setLocale({
    string: {
      url: i18instance.t('response.incorrectUrl'),
    },
  });

  const schema = yup.object({
    url: yup.string().url().required(),
  });

  const validateUrl = (url) => schema.validate({ url })
    .then((result) => result)
    .catch((err) => {
      console.log(err);
      throw new Error('incorrectUrl');
    });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.form.status = 'filling';
    const incomingValue = input.value.trim();

    updateFormAndBtn(state);
    validateUrl(incomingValue)
      .then(({ url }) => {
        if (state.subscribes.includes(url)) {
          state.form.validation = false;
          throw new Error('alreadyExists');
        }
        state.form.validation = true;
        console.log(url);
        return fetchFeed(url);
      })
      .then((data) => {
        state.subscribes.push(incomingValue);
        state.form.status = 'processed';
        return parseFeed(data.contents);
      })
      .then((result) => {
        const { feedTitle, feedDescription, posts } = result;
        state.feeds.titles = [...state.feeds.titles, feedTitle];
        state.feeds.descriptions = [...state.feeds.descriptions, feedDescription];
        state.feeds.posts = [...state.feeds.posts, ...posts];
        console.log(state.feeds.posts);
        renderFeed(result);
      })
      .catch((error) => {
        console.error(error);
        state.form.validation = false;
        state.form.status = error.message;
      })
      .finally(() => {
        updateFormAndBtn(state);
        renderErrors(state, i18instance);
      });
  });

  postsContainer.addEventListener('click', (e) => {
    const elementId = e.target.dataset.id;
    const post = state.feeds.posts.find((p) => p.id === elementId);
    if (!post) {
      return;
    }
    post.read = true;
    if (e.target instanceof HTMLAnchorElement) {
      makeRead(e);
    }
    if (e.target instanceof HTMLButtonElement) {
      const anchor = e.target.previousSibling;
      showModal(post.title, post.description, post.link, anchor);
    }
  });

  checkNewPosts();
  renderStaticElements({
    title, button, label, subtitle,
  }, i18instance, state);
  renderErrors(state, i18instance);
};

export default app;
