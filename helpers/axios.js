// import from node_modules
const axios = require("axios");

const sendEmail = axios.create({
  baseURL: "https://ktemuan-e8fb.restdb.io",
  headers: {
    "x-apikey": "948544c49eb63b1d8defb2ce5754adabd00a5",
  },
});

module.exports = {
  sendEmail,
};
