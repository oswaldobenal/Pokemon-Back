const { Router } = require("express");
const {
  getPokemons,
  getPokemonById,
  getPokemonTypes,
  createPokemon,
} = require("../controllers/pokemons.controller.js");
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

router.get("/pokemons", getPokemons);
router.get("/pokemons/:id", getPokemonById);
router.get("/types", getPokemonTypes);
router.post("/pokemons", createPokemon);

module.exports = router;
