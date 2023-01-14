const axios = require("axios");

//In case update not works directly fetch from url
async function api(url) {
  const res = await axios.get(
    url === "" ? "https://www.reddit.com/r/memes/new.json" : url
  );
  const memes = res.data.data;
  return memes;
}
module.exports = { api };
