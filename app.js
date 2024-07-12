const { default: axios } = require("axios");
const venom = require("venom-bot");

venom
  .create({
    session: "chatGPT_BOT", // Ensure the session name is correct
    multidevice: true, // Enable multi-device support
    folderSession: "./sessions", // Define the path to store session data
  })
  .then((client) => start(client))
  .catch((err) => console.error("Error during session creation:", err));

const header = {
  "Content-Type": "application/json",
  "Authorization": "Bearer CHAVE-apiDOCHATGPT",
};

const start = (client) => {
  client.onMessage((message) => {
    axios
      .post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message.body }],
        },
        { headers: header }
      )
      .then((response) => {
        // Ensure proper logging of the response
        console.log(response.data);
      })
      .catch((err) => {
        // Ensure proper logging of the error
        console.error("Error:", err.response ? err.response.data : err.message);
      });
  });
};

