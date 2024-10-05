import onChange from 'on-change';
import { v4 as uuidv4 } from 'uuid';
import state from './state.js';

export const pageElements = {
  form: document.querySelector('.rss_form'),
  title: document.querySelector('#title'),
  subtitle: document.querySelector('#subtitle'),
  input: document.querySelector('#rss_input'),
  label: document.querySelector('#input_label'),
  button: document.querySelector('#rss_submit'),
  feedback: document.querySelector('.feedback'),
  postsContainer: document.querySelector('.posts'),
  feedsContainer: document.querySelector('.feeds'),
  body: document.body,
};

const reset = () => {
  pageElements.button.disabled = false;
  pageElements.input.value = '';
  pageElements.input.focus();
};

const renderErrors = (watchState, i18n) => {
  try {
    console.log('Current status:', watchState.form.status); // Для отладки
    switch (watchState.form.status) {
      case 'alreadyExists':
        pageElements.feedback.textContent = i18n.t('response.alreadyExists');
        break;
      case 'processed':
        pageElements.feedback.textContent = i18n.t('response.urlAdded');
        break;
      case 'incorrectUrl':
        pageElements.feedback.textContent = i18n.t('response.incorrectUrl');
        break;
      case 'invalidResource':
        pageElements.feedback.textContent = i18n.t('response.invalidResource');
        break;
      case 'networkErr':
        pageElements.feedback.textContent = i18n.t('response.networkErr');
        break;
      default:
        pageElements.feedback.textContent = '';
        break;
    }
    if (watchState.form.status !== 'processed') {
      pageElements.feedback.style.color = 'red';
    } else {
      pageElements.feedback.style.color = 'green';
    }
  } catch (err) {
    console.error('Unexpected behavior:', err);
  }
};
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
const renderStaticElements = (elements, i18n) => {
  const keys = Object.keys(elements);
  keys.forEach((key) => {
    const updatedText = i18n.t(`${key}`);
    if (elements[key]) {
      elements[key].textContent = updatedText;
    }
  });
  return elements;
};
/* eslint-enable no-param-reassign */

// legendarnaya funkciya :)
const makeRead = (e) => {
  e.target.classList.remove('fw-bold');
  e.target.classList.add('fw-normal', 'link-secondary');
};

// chut' menee legendarnaya
const showModal = (title, description, link, anchor) => {
  const modalTitle = document.querySelector('.modal-title');
  modalTitle.textContent = title;

  const modalBody = document.querySelector('.modal-body');
  modalBody.textContent = description;

  const modalFooter = document.querySelector('.modal-footer a');
  modalFooter.setAttribute('href', link);

  anchor.classList.remove('fw-bold');
  anchor.classList.add('fw-normal', 'link-secondary');
};

const createWrapper = (container) => {
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h2');
  const ulListGroup = document.createElement('ul');

  card.classList.add('card', 'border-0');
  cardBody.classList.add('card-body');
  cardTitle.classList.add('card-title');
  ulListGroup.classList.add('list-group', 'border-0', 'rounded-0');

  cardTitle.textContent = container.classList.contains('posts') ? 'Посты' : 'Фиды';

  card.append(cardBody);
  cardBody.append(cardTitle);
  cardBody.append(ulListGroup);

  return container.append(card);
};

const createPostItem = (id, title, link, read) => {
  const postItem = document.createElement('li');
  postItem.classList.add('list-group-item', 'border-0', 'd-flex', 'justify-content-between', 'align-items-start', 'border-end-0');

  const itemA = document.createElement('a');
  itemA.setAttribute('data-id', `${id}`);
  itemA.classList.add(read ? ('fw-normal', 'link-secondary') : 'fw-bold');
  itemA.textContent = title;
  itemA.href = link;
  itemA.target = '_blank';
  itemA.rel = 'noopener norefferer';

  const targetId = itemA.dataset.id;
  const itemButton = document.createElement('button');
  itemButton.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'modal_btn');
  itemButton.textContent = 'Просмотр';
  itemButton.type = 'button';
  itemButton.setAttribute('data-id', targetId);
  itemButton.setAttribute('data-bs-toggle', 'modal');
  itemButton.setAttribute('data-bs-target', '#modal');

  postItem.append(itemA, itemButton);
  return postItem;
};

const createFeedItem = (title, descriptions) => {
  const feedItem = document.createElement('li');
  const itemH3 = document.createElement('h3');
  const itemP = document.createElement('p');

  feedItem.classList.add('list-group-item', 'border-0', 'rounded-0');
  itemH3.classList.add('h6', 'm-0');
  itemP.classList.add('small', 'text-black-50', 'm-0');

  itemH3.textContent = title;
  itemP.textContent = descriptions;

  feedItem.append(itemH3, itemP);
  return feedItem;
};
const watchState = onChange(state, (path) => {
  if (path === 'form.status') {
    renderErrors(state, i18n);
  }
});

const renderFeed = () => {
  const postBlock = pageElements.postsContainer;
  const feedBlock = pageElements.feedsContainer;
  const { feeds } = watchState;
  const { titles, descriptions, posts } = feeds;

  if (!postBlock.querySelector('.card')) {
    createWrapper(postBlock);
  }
  if (!feedBlock.querySelector('.card')) {
    createWrapper(feedBlock);
  }

  const postsUl = postBlock.querySelector('ul');
  const feedsUl = feedBlock.querySelector('ul');

  postsUl.innerHTML = '';
  feedsUl.innerHTML = '';

  titles.map((title, index) => {
    const feedItem = createFeedItem(title, descriptions[index]);
    return feedsUl.append(feedItem);
  });
  /* eslint-disable no-param-reassign */
  posts.map((post) => {
    const id = uuidv4();
    const postItem = createPostItem(post.id = id, post.title, post.link, post.read);
    return postsUl.append(postItem);
  });
};
/* eslint-enable no-param-reassign */
export {
  renderErrors, renderStaticElements, renderFeed, makeRead, showModal,
  reset,
};
