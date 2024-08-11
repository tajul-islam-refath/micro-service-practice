const express = require("express");
const app = express();

app.use(express.json());

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (e) {
    if (retries > 0) {
      console.log(`Retrying... (${MAX_RETRIES - retries + 1})`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    } else {
      throw e; // Throw error after all retries are exhausted
    }
  }
}

app.post("/addition", async (req, res, next) => {
  try {
    const { addition } = req.body;
    const response = await fetchWithRetry("http://127.0.0.1:7000/addition/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ addition }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { result } = await response.json();

    res.status(200).json({
      result,
    });
  } catch (e) {
    console.error("Error occurred:", e);

    let errorMessage = "Something went wrong.";
    let statusCode = 500;

    // Customize the error message based on the type or code
    if (e.name === "FetchError") {
      errorMessage = "Failed to fetch data from the server.";
    } else if (e.name === "TypeError") {
      errorMessage = "There was a type error.";
    } else if (e.message.includes("HTTP error")) {
      errorMessage = "There was a problem with the external service.";
      statusCode = e.message.includes("status: 404") ? 404 : 500;
    } else if (e.code === "ECONNREFUSED") {
      errorMessage =
        "Connection refused. Please check if the server is running.";
      statusCode = 503;
    } else if (e.code === "ENOTFOUND") {
      errorMessage = "Service not found. Please check the URL.";
      statusCode = 404;
    }

    res.status(statusCode).json({ error: errorMessage });
  }
});
app.post("/subtraction", (req, res) => {
  const { subtraction } = req.body;
});
app.post("/multiplication", (req, res) => {
  const { multiplication } = req.body;
});
app.post("/division", (req, res) => {
  const { division } = req.body;
});

app.listen(5000, () => {
  console.log("ServiceA is running");
});
