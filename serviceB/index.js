const express = require("express");
const app = express();

app.use(express.json());
app.post("/addition", (req, res) => {
  const { addition } = req.body;

  const array = addition.split("+");
  const result = parseInt(array[0]) + parseInt(array[1]);

  res.status(200).json({
    result,
  });
});

app.listen(7000, () => {
  console.log("ServiceB is running", 7000);
});
