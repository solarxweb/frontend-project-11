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
      console.log(error.message);
      if (error.message === 'Network Error') {
        throw new Error('networkErr');
      }
      throw error;
    });
};

export default fetchFeed;
