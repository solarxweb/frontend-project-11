const parseFeed = (data) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, 'text/xml');
  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('invalidResource');
  }
  const channel = xmlDoc.querySelector('channel');

  const feedTitle = channel.querySelector('title').textContent;
  const feedDescription = channel.querySelector('description').textContent;

  const items = channel.querySelectorAll('item');
  const posts = Array.from(items).map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;

    return {
      title,
      description,
      link,
    };
  });
  return ({ feedTitle, feedDescription, posts });
};

export default parseFeed;
