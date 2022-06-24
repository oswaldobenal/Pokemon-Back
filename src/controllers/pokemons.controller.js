const axios = require("axios");
const { Pokemon, Type } = require("../db.js");

//Funciones para traer la informacion de la api y la base de datos.
const getApiInfo = async () => {
  try {
    const info = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?offset=0&limit=40"
    );
    const { results } = info.data;

    let Pokemons = [];

    for (let i = 0; i < results.length; i++) {
      if (!results[i]) {
        console.log(i);
        return Pokemons;
      }
      if (results[i].url) {
        const pokemon = await axios.get(`${results[i].url}`);
        const { name, id, weight, types, sprites, stats } = pokemon.data;
        Pokemons.push({
          id: id,
          name: name,
          types: types.map((t) => t.type.name),
          image: sprites.other.dream_world.front_default,
          life: stats[0].base_stat,
          attack: stats[1].base_stat,
          speed: stats[5].base_stat,
          defence: stats[2].base_stat,
          weight: weight,
          height: pokemon.data.height,
        });
      }
    }
    return Pokemons;
  } catch (error) {
    console.log(error);
  }
};

const getDbInfo = async () => {
  return await Pokemon.findAll({
    include: {
      model: Type,
      attributes: ["name"],
      through: {
        attributes: [],
      },
    },
  });
};

const allPokemons = async () => {
  try {
    const apiInfo = await getApiInfo();
    const dbInfo = await getDbInfo();
    const allData = apiInfo.concat(dbInfo);
    return allData;
  } catch (error) {
    console.log(error);
  }
};
// Este controlador sirve tanto para la ruta get pokemons como tambien para obtener pokemons por nombre
const getPokemons = async (req, res) => {
  const { name } = req.query;
  const data = await allPokemons();
  try {
    if (name) {
      let pokemonName = data.filter(
        (el) => el.name.toLowerCase() === name.toLowerCase()
      );
      pokemonName.length
        ? res.status(200).send(pokemonName)
        : res.status(400).send("Pokemon not found");
    } else {
      return res.send(data);
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

//funciones para traer los pokemons por ID

const apiPokemonById = async (id) => {
  try {
    const idInfo = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const pokemonData = {
      id: idInfo.data.id,
      name: idInfo.data.name,
      types: idInfo.data.types.map((t) => t.type.name),
      image: idInfo.data.sprites.other.dream_world.front_default,
      life: idInfo.data.stats[0].base_stat,
      attack: idInfo.data.stats[1].base_stat,
      speed: idInfo.data.stats[5].base_stat,
      defence: idInfo.data.stats[2].base_stat,
      weight: idInfo.data.weight,
      height: idInfo.data.height,
    };
    return pokemonData;
  } catch (error) {
    console.log(error);
  }
};

const getPokemonById = async (req, res) => {
  const { id } = req.params;
  try {
    const pokemonData = await allPokemons();
    const pokeId = pokemonData.filter((el) => el.id === id);
    if (pokeId.length) {
      return res.send(pokeId[0]);
    } else {
      const pokeApi = await apiPokemonById(id);
      return res.status(200).send(pokeApi);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Controlador para traer los tipos de pokemons
const getPokemonTypes = async (req, res) => {
  try {
    const apiInfo = await axios.get("https://pokeapi.co/api/v2/type");
    const types = apiInfo.data.results.map((el) => el.name);
    types.forEach((element) =>
      Type.findOrCreate({
        where: {
          name: element,
        },
      })
    );
    return res.send(types);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

// Controlador para crear nuevos Pokemons.
const createPokemon = async (req, res) => {
  const {
    name,
    image,
    life,
    attack,
    defence,
    speed,
    height,
    weight,
    types,
    createdInDb,
  } = req.body;
  try {
    const pokeTypes = await Type.findAll({
      where: {
        name: types,
      },
    });

    if (name) {
      let newPokemon = await Pokemon.create({
        name,
        image,
        life,
        attack,
        defence,
        speed,
        height,
        weight,
        createdInDb,
      });
      newPokemon.addType(pokeTypes);
      return res.status(201).send("Recipe has been created successfully");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
module.exports = {
  getPokemons,
  getPokemonById,
  getPokemonTypes,
  createPokemon,
};
