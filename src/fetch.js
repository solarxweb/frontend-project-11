import axios from 'axios';

const fetchFeed = (url) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}&disableCache=true`;

  return axios.get(proxyUrl)
    .then((response) => {
      if (response.data.contents === null) {
        throw new Error('networkErr');
      }
      return response.data;
    })
    .catch((error) => {
      console.error(error);
      throw new Error('networkErr');
    });
};

export default fetchFeed;
