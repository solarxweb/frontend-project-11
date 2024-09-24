import onChange from "on-change";
import i18next from "i18next";
import state from "./state.js";

const renderErrors = (watchedState, i18n) => {
  i18n = i18next;
  const result = document.querySelector(".feedback");

  try {
    switch (watchedState.form.status) {
      case "contains":
        result.textContent = i18n.t("response.alreadyExists");
        break;
      case "processed":
        result.textContent = i18n.t("response.urlAdded");
        break;
      case "aborted":
        result.textContent = i18n.t("response.incorrectUrl");
        break;
      case 'invalidResource':
        result.textContent = i18n.t('response.invalidResource');
        break;
      case 'networkErr':
        result.textContent = i18n.t('response.networkErr');
        break;
      default:
        break;
    }
  } catch (err) {
    throw Error("Unexpected behavior:", err);
  }
};

const watchState = onChange(state, (path) => {
  if (path === 'state.form.status') {
    renderErrors(watchState, i18next);
  }
});

const renderStaticElements = (elements, i18n) => {
  i18n = i18next;
  const keys = Object.entries(elements);
  keys.forEach(([key, element]) => {
    element.textContent = i18n.t(`${key}`);
  });
  return elements;
};

const renderFeed = (watchedState) => {
  const postsContainer = document.querySelector('.posts');
  const feedsContainer = document.querySelector('.feeds');

  const { feeds } = watchedState;
  const { titles, descriptions, posts } = feeds;
  console.log(posts);

  feedsContainer.innerHTML = `
    <div class='card border-0'>
        <div class='card-body'>
          <h2 class='card-title'>Фиды</h2>
        </div>
    </div>
    <ul class='list-group border-0 rounded-0'>
      ${titles.map((title, index) => `
        <li class='list-group-item border-0 border-end-0'>
          <h3 class='h6 m-0'>${title}</h3>
          <p class='m-0 small text-black-50'>${descriptions[index]}</p>
        </li>
      `).join('')}
    </ul>
  `;

  postsContainer.innerHTML = `
  <div class='card border-0'>
        <div class='card-body'>
          <h2 class='card-title'>Посты</h2>
        </div>
    </div>
    <ul class='list-group border-0 rounded-0'>
    ${posts.map((post) => `
        <li class='list-group-item d-flex justify-content-between align-items-start border-0 border-end-0'>
            <a id='${post.id}' class='${post.read ? 'fw-normal' : 'fw-bold'}' href="${post.link}" target="_blank" rel="noopener noreferrer">${post.title}</a>
            <button class='btn btn-outline-primary btn-sm modal_btn' type='button' data-bs-target='#modal-${post.id}' data-bs-toggle='modal'>Просмотр</button> 
        </li>
        <div class="modal fade" id="modal-${post.id}" tabindex="-1" aria-labelledby="modalLabel-${post.id}" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalLabel-${post.id}">${post.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>${post.description}</p>
                    </div>
                    <div class="modal-footer">
                        <a href=${post.link} target="_blank" class="btn btn-primary full-article">Читать полностью</a>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('')}  
</ul>`;
};

export { renderErrors, renderStaticElements, renderFeed };
/** data-bs-target='#modal' data-bs-toggle='modal' */
