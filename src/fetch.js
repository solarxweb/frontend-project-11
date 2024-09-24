import axios from "axios";

const fetchFeed = async (url) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}&disableCache=true`;
  const response = await axios.get(proxyUrl);
  return response ? response.data : null;
};

export default fetchFeed;
