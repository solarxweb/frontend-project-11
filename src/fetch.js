import axios from "axios";

const fetchFeed = async (url) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}&disableCache=true`;
    return await axios.get(proxyUrl)
      .then(response => response)
      .catch(err => err)
};

export default fetchFeed;