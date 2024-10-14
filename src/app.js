import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import {
  watchedState, pageElements, showModal,
  makeRead, i18instance,
} from './view.js';
import fetchFeed from './fetch.js';
import parseFeed from './parser.js';

const checkNewPosts = () => {
  /* eslint-disable prefer-destructuring */
  const body = pageElements.body;
  /* eslint-enable prefer-destructuring */

  const promises = watchedState.subscribes.map((feedUrl) => fetchFeed(feedUrl)
    .then((data) => parseFeed(data.contents))
    .then((result) => {
      const oldPosts = watchedState.feeds.flatMap((feed) => feed.posts);
      const { fTitle, posts } = result;
      const existingNames = new Set(oldPosts.map(({ title }) => title));
      const newPosts = posts.filter((post) => !existingNames.has(post.title));

      if (!body.classList.contains('modal-open') && newPosts.length > 0) {
        const feedIndex = watchedState.feeds.findIndex((feed) => feed.title === fTitle);

        if (feedIndex !== -1) {
          watchedState.feeds[feedIndex].posts.push(...newPosts.map((post) => ({
            ...post,
            id: uuidv4(),
            read: false,
          })));
        }
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

const app = async () => {
  const { form, input, postsContainer } = pageElements;
  input.focus();

  yup.setLocale({
    string: {
      url: i18instance.t('response.incorrectUrl'),
      notOneOf: i18instance.t('response.alreadyExists'),
    },
  });

  const validateUrl = (url, urls) => {
    const schema = yup
      .string()
      .trim()
      .url('incorrectUrl')
      .notOneOf(urls, 'alreadyExists');
    return schema.validate(url);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.status = 'filling';
    const incomingValue = input.value.trim();

    validateUrl(incomingValue, watchedState.subscribes)
      .then((url) => {
        watchedState.form.validation = true;
        return fetchFeed(url);
      })
      .then((data) => {
        const parsedPage = parseFeed(data.contents);
        const { feedTitle, feedDescription, posts } = parsedPage;
        watchedState.subscribes.push(incomingValue);
        const postsWithIds = posts.map((post) => ({
          ...post,
          id: uuidv4(),
          read: false,
        }));
        watchedState.feeds.push({
          feedTitle,
          feedDescription,
          posts: postsWithIds,
        });
        watchedState.form.status = 'processed';
      })
      .catch((error) => {
        console.error(error);
        watchedState.form.validation = false;
        watchedState.form.status = error.message;
      });
  });

  postsContainer.addEventListener('click', (e) => {
    const elementId = e.target.dataset.id;
    const posts = watchedState.feeds.flatMap((feed) => feed.posts);
    const post = posts.find((p) => p.id === elementId);
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
};

checkNewPosts();
export { app, i18instance };
