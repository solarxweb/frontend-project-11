import * as yup from "yup";
import i18next from "i18next";
import state from "./state.js";
import ru from "./locale/ru.js";
import {
  renderErrors, renderStaticElements, renderFeed, makeModalandRead,
} from "./view.js";
import fetchFeed from "./fetch.js";
import { parseFeed, getFeedElements } from "./parser.js";

const form = document.querySelector(".rss_form");
const input = form.querySelector('input[name="url"]');
const postsBlock = document.querySelector(".posts");

const checkNewPosts = async () => {
  const promises = state.subscribes.map(async (feedUrl) => {
    try {
      const response = await fetchFeed(feedUrl);
      const channel = await parseFeed(response.contents);

      if (channel) {
        const { body } = document;
        const content = await getFeedElements(channel);
        const { posts } = content;

        // Получаем существующие идентификаторы постов
        const existingPostIds = new Set(state.feeds.posts.map((post) => post.id));
        const newPosts = posts.filter((post) => !existingPostIds.has(post.id));

        if (!body.classList.contains("modal-open")) {
          if (newPosts.length > 0) {
            state.feeds.posts.push(
              ...newPosts.map((post) => ({
                ...post,
                read: false,
              })),
            );
            renderFeed(state, {
              feedTitle: channel.title,
              feedDescription: channel.description,
              posts: newPosts,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Ошибка при проверке постов в потоке ${feedUrl}:`, error);
    }
  });

  await Promise.all(promises);
  setTimeout(checkNewPosts, 5000);
};
const staticElements = {
  title: document.getElementById("title"),
  subtitle: document.getElementById("subtitle"),
  label: document.getElementById("input_label"),
  button: document.getElementById("rss_submit"),
};

const app = async () => {
  input.focus();

  const i18instance = await i18next.createInstance();
  i18instance.init({
    lng: state.defLang,
    debug: true,
    resources: {
      ru,
    },
  });

  yup.setLocale({
    string: {
      url: i18instance.t("response.incorrectUrl"),
    },
  });

  const schema = yup.object({
    url: yup.string().url().required(),
  });

  const validateUrl = async (url) => schema.validate({ url });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    staticElements.button.disabled = true;
    const incomingUrl = input.value.trim();
    state.form.status = "filling";

    try {
      await validateUrl(incomingUrl).catch((err) => {
        state.form.status = "aborted";
        state.form.validation = false;
        throw new Error(err);
      });
      if (state.subscribes.includes(incomingUrl)) {
        state.form.status = "contains";
      } else {
        state.form.validation = true;
        const response = await fetchFeed(incomingUrl).catch((errFetch) => {
          state.form.status = "networkErr";
          console.log(errFetch);
        });
        const channel = await parseFeed(response.contents);
        if (!channel) {
          state.form.status = "invalidResource";
        } else {
          state.subscribes.push(incomingUrl);
          return getFeedElements(channel).then((content) => {
            state.form.status = "processed";

            const { feedTitle, feedDescription, posts } = content;
            state.feeds.titles.push(feedTitle);
            state.feeds.descriptions.push(feedDescription);
            state.feeds.posts = [...state.feeds.posts, ...posts];
            console.log(state.feeds.posts);
            input.value = "";
            input.focus();

            renderErrors(state, i18instance);
            renderFeed(state, { feedTitle, feedDescription, posts });
          });
        }
      }
    } catch (err) {
      console.log(`Unexpected behavior: ${err}`);
    } finally {
      staticElements.button.disabled = false;
      input.value = "";
      input.focus();
    }

    return renderErrors(state, i18instance);
  });

  postsBlock.addEventListener("click", (e) => {
    makeModalandRead(e);
  });

  checkNewPosts();
  renderStaticElements(staticElements, i18instance);
};

export default app;
