import onChange from 'on-change';
import i18next from 'i18next';
import state from './state.js';

const renderErrors = (watchedState, i18n) => {
  const result = document.querySelector('.feedback');

  try {
    switch (watchedState.form.status) {
      case 'contains':
        result.textContent = i18n.t('response.alreadyExists');
        break;
      case 'processed':
        result.textContent = i18n.t('response.urlAdded');
        break;
      case 'aborted':
        result.textContent = i18n.t('response.incorrectUrl');
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
    throw Error('Unexpected behavior:', err);
  }
};

const watchState = onChange(state, (path) => {
  if (path === 'state.form.status') {
    renderErrors(watchState, i18next);
  }
});

const renderStaticElements = (elements, i18n) => {
  const keys = Object.entries(elements);
  const messages = {};                  
  keys.forEach(([key, element]) => {    //
    messages[key] = i18n.t(`${key}`);   // <===----- костыль чтобы избежать ошибки: Assignment to property of function parameter 'element' no-param-reassign
  });                                   //
  keys.forEach(([key, element]) => {
    element.textContent = messages[key]; 
  });

  return elements; 
};

const makeModalandRead = (e) => {
  if (e.target instanceof HTMLAnchorElement) {
    const postId = e.target.id;

    const post = watchState.feeds.posts.find((p) => p.id === postId);
    if (post && !post.read) {
      post.read = true;
      e.target.classList.remove('fw-bold');
      e.target.classList.add('fw-normal', 'link-secondary');
    }
  } else if (e.target.classList.contains('modal_btn')) {
    const idOfElement = e.target.dataset.bsTarget.split('modal-')[1];
    const post = watchState.feeds.posts.find((p) => p.id === idOfElement);
    if (post) {
      if (!post.read) {
        post.read = true;
        const element = document.getElementById(idOfElement);
        element.classList.remove('fw-bold');
        element.classList.add('fw-normal', 'link-secondary');
      }

      const modalTitle = document.querySelector(`#modal-${idOfElement} .modal-title`);
      modalTitle.textContent = post.title;

      const modalBody = document.querySelector(`#modal-${idOfElement} .modal-body p`);
      modalBody.textContent = post.description;

      const modalFooter = document.querySelector(`#modal-${idOfElement} .modal-footer a`);
      modalFooter.setAttribute('href', post.link);
    }
  }
};

const renderFeed = (watchedState) => {
  const postsContainer = document.querySelector('.posts');
  const feedsContainer = document.querySelector('.feeds');

  const { feeds } = watchedState;
  const { titles, descriptions, posts } = feeds;

  feedsContainer.innerHTML = `
    <div class='card border-0'>
      <div class='card-body'>
        <h2 class='card-title'>Фиды</h2>
      </div>
    </div>
    <ul class='list-group border-0 rounded-0'>
      ${titles
    .map(
      (title, index) => `
          <li class='list-group-item border-0 border-end-0'>
              <h3 class='h6 m-0'>${title}</h3>
              <p class='m-0 small text-black-50'>${descriptions[index]}</p>
          </li>
    `,
    )
    .join('')}
    </ul>
  `;

  postsContainer.innerHTML = `
    <div class='card border-0'>
      <div class='card-body'>
        <h2 class='card-title'>Посты</h2>
      </div>
    </div>
    <ul class='list-group border-0 rounded-0'>
      ${posts
    .map(
      (post) => `<li class='list-group-item d-flex justify-content-between align-items-start border-0 border-end-0'>
            <a id='${post.id}' class='${post.read ? 'fw-normal link-secondary' : 'fw-bold'}' href='${post.link}' target='_blank' rel='noopener noreferrer'>
              ${post.title}
            </a>
            <button class='btn btn-outline-primary btn-sm modal_btn'
                    type='button'
                    data-bs-target='#modal-${post.id}'
                    data-bs-toggle='modal'>Просмотр</button>
              <div class='modal fade' id='modal-${post.id}' tabindex='-1' aria-labelledby='modalLabel-${post.id}' aria-hidden='true'>
              <div class='modal-dialog'>
                <div class='modal-content'>
                  <div class='modal-header'>
                    <h5 class='modal-title' id='modalLabel-'></h5>
                    <button type='button' class='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
                  </div>
                  <div class='modal-body'>
                    <p></p>  
                  </div>
                  <div class='modal-footer'>
                    <a href='' target='_blank' class='btn btn-primary full-article'>Читать полностью</a>
                    <button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Закрыть</button>
                  </div>
                </div>
              </div>
            </div>
            </li>`,
    )
    .join('')} 
        
    </ul>`;
};

export {
  renderErrors, renderStaticElements, renderFeed, makeModalandRead,
};
