const express = require("express");
const app = express();

const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const path = require("path");

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "../public")));

app.get("/test", (req, res) => {
  res.send("Server working ✅");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});