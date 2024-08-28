import * as yup from "yup";
import onChange from "on-change";
import render from "./view.js";

const app = () => {
  const form = document.querySelector(".rss_form");
  const input = form.querySelector('input[name="url"]');

  const state = {
    form: {
      url: "",
      valid: false,
    },
    errors: [],
    feeds: [],
  };

  input.focus();

  const watchState = onChange(state, () => {
    render(state);
  });

  const schema = yup.object({
    url: yup
      .string()
      .url("Введите корректный URL")
      .required("Поле не может быть пустым!"),
  });

  const validateFeed = (url) => schema.validate({ url });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const incomingUrl = input.value.trim().toLowerCase();

    try {
      const { url } = await validateFeed(incomingUrl);

      // Проверяем, был ли URL ранее добавлен
      if (watchState.feeds.includes(url)) {
        watchState.errors.push("Этот URL уже был добавлен.");
        watchState.form.valid = false;
      } else {
        watchState.feeds.push(url);
        watchState.errors = [];
        watchState.form.valid = true;
      }
    } catch (err) {
      // Обрабатываем ошибки валидации
      watchState.errors.push(err.message);
      watchState.form.valid = false;
    }

    // Очищаем поле ввода
    input.value = "";
    input.focus();
  });

  render(state); // Инит
};
app();
