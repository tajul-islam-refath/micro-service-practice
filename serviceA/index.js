const express = require("express");
const app = express();

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = "../proto/calculator.proto";

app.use(express.json());

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Load the protobuf
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const calculatorProto =
  grpc.loadPackageDefinition(packageDefinition).calculator;

// Create a gRPC client
const client = new calculatorProto.Calculator(
  "127.0.0.1:7000",
  grpc.credentials.createInsecure()
);

async function fetchWithRetry(addition, retries = MAX_RETRIES) {
  try {
    client.Add(
      { number1: addition[0], number2: addition[1] },
      (error, response) => {
        if (error) {
          console.error("Error occurred:", error);
          throw Error("Failed to communicate with service B.");
        } else {
          res.status(200).json({ result: response.result });
        }
      }
    );
  } catch (e) {
    if (retries > 0) {
      console.log(`Retrying... (${MAX_RETRIES - retries + 1})`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(addition, retries - 1);
    } else {
      throw e; // Throw error after all retries are exhausted
    }
  }
}

app.post("/addition", async (req, res, next) => {
  const { query } = req.body;
  if (query.indexOf("+") != 1) {
    res.status(400).json({
      error: "Query pattern should be (num+num)",
    });
    return;
  }
  const array = query.split("+");
  client.add({ number1: array[0], number2: array[1] }, (error, response) => {
    if (error) {
      console.error("Error occurred:", error);
      res.status(500).json({ error: "Failed to communicate with service B." });
    } else {
      res.status(200).json({ result: response.result });
    }
  });
});
app.post("/subtraction", (req, res) => {
  const { query } = req.body;
  if (query.indexOf("-") != 1) {
    res.status(400).json({
      error: "Query pattern should be (num-num)",
    });
    return;
  }
  const array = query.split("-");

  client.subtraction(
    { number1: array[0], number2: array[1] },
    (error, response) => {
      if (error) {
        console.error("Error occurred:", error);
        res.status(500).json({
          error: "Failed /subtraction to communicate with service B.",
        });
      } else {
        console.log(response);
        res.status(200).json({ result: response.result });
      }
    }
  );
});

app.post("/multiplication", (req, res) => {
  const { query } = req.body;
  if (query.indexOf("*") != 1) {
    res.status(400).json({
      error: "Query pattern should be (num*num)",
    });
    return;
  }
  const array = query.split("*");
  client.multiplication(
    { number1: parseInt(array[0]), number2: parseInt(array[1]) },
    (error, response) => {
      if (error) {
        console.error("Error occurred:", error);
        res.status(500).json({
          error: "Failed /subtraction to communicate with service B.",
        });
      } else {
        res.status(200).json({ result: response.result });
      }
    }
  );
});
app.post("/division", (req, res) => {
  const { division } = req.body;
});

app.listen(5000, () => {
  console.log("ServiceA is running");
});
