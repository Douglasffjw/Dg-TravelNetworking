//Carlos
const express = require("express");
const router = express.Router();

// Lista de destinos (pode vir do banco futuramente)
const destinos = [
  { id: 1, city: "Paris", image: "paris.jpg" },
  { id: 2, city: "Tokyo", image: "tokyo.jpg" },
  { id: 3, city: "New York", image: "new-york.jpg" },
  { id: 4, city: "London", image: "london.jpg" },
  { id: 5, city: "Rome", image: "rome.jpg" },
  { id: 6, city: "Dubai", image: "dubai.jpg" },
  { id: 7, city: "Sydney", image: "sydney.jpg" },
  { id: 8, city: "Rio de Janeiro", image: "rio-de-janeiro.jpg" },
  { id: 9, city: "Cape Town", image: "cape-town.jpg" },
  { id: 10, city: "Bangkok", image: "bangkok.jpg" },
  { id: 11, city: "Barcelona", image: "barcelona.jpg" },
  { id: 12, city: "Toronto", image: "toronto.jpg" },
];

// Rota GET /api/destinations
router.get("/", (req, res) => {
  res.status(200).json(destinos);
});

module.exports = router;