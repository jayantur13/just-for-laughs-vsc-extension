const axios = require("axios");

async function api(subreddit, count) {
  const url =
    `https://meme-api.com/gimme/${subreddit}/${count}`;

  //console.log(url);

  const res = await axios.get(url);

  return res.data;
}
module.exports = { api };