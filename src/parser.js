import { v4 as uuidv4 } from 'uuid';

const getFeedElements = async (page) => {
  const feedTitle = page.querySelector('title').textContent;
  const feedDescription = page.querySelector('description').textContent;

  const items = page.querySelectorAll('item');
  const posts = Array.from(items).map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    
    return {
      id: uuidv4(),
      title,
      description,
      link,
    };
  });

  return { feedTitle, feedDescription, posts };
};

const parseFeed = async (data) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'application/xml');
    const channel = xmlDoc.querySelector('channel');

    return (channel === null) ? false : channel;
};

export { parseFeed, getFeedElements };