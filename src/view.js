import onChange from 'on-change';

import state from './state.js';

const pageElements = {
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

const renderErrors = (value) => {
  pageElements.feedback.textContent = value;
  if (value !== 'RSS успешно загружен') {
    pageElements.feedback.style.color = 'red';
  } else {
    pageElements.feedback.style.color = 'green';
  }
};

const makeRead = (id) => {
  const anchor = document.querySelector(`a[data-id="${id}"]`);
  anchor.classList.remove('fw-bold');
  anchor.classList.add('fw-normal', 'link-secondary');
};

const showModal = (post) => {
  const {
    id, title, description, link,
  } = post;
  const anchor = document.querySelector(`a[data-id="${id}"]`);
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

const renderFeed = (feeds) => {
  const postBlock = pageElements.postsContainer;
  const feedBlock = pageElements.feedsContainer;

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

  feeds.forEach((feed) => {
    const { feedTitle, feedDescription } = feed;
    const feedItem = createFeedItem(feedTitle, feedDescription);
    feedsUl.append(feedItem);

    feed.posts.map((post) => {
      const postItem = createPostItem(post.id, post.title, post.link, post.read);
      return postsUl.append(postItem);
    });
  });
};

const watchedState = onChange(state, (path, curValue, prev) => {
  if (path === 'preparedness') {
    pageElements.input.focus();
  }
  if (path === 'form.status') {
    if (curValue === 'filling') return;
    renderErrors(curValue);
    pageElements.button.disabled = (curValue === 'filling');
    if (prev === 'filling') {
      pageElements.input.value = '';
      pageElements.input.focus();
    }
  }
  if (path === 'feeds' || path === 'posts') {
    renderFeed(watchedState.feeds);
  }
  if (path === 'watchedResources') {
    const subject = watchedState.watchedResources.at(-1);
    if (subject.clickedOn === 'button') {
      showModal(subject.post);
    } else {
      makeRead(subject.elementId);
    }
  }
});

export {
  makeRead, showModal, pageElements,
  watchedState,
};
