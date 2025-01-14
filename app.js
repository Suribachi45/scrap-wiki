const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

// URL principal de la categoría de músicos de rap
const baseUrl = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap';

// Función para extraer datos de una página de Wikipedia
async function scrapePage(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $('h1.firstHeading').text();
    const images = $('img').map((i, el) => $(el).attr('src')).get();
    const paragraphs = $('p').map((i, el) => $(el).text()).get();

    return { title, images, paragraphs };
  } catch (error) {
    console.error(`Error al procesar ${url}:`, error);
    return null;
  }
}

// Ruta para iniciar el scraping
app.get('/', async (req, res) => {
  try {
    const response = await axios.get(baseUrl);
    const $ = cheerio.load(response.data);
    const musicianLinks = $('#mw-pages a').map((i, el) => $(el).attr('href')).get();

    const musiciansData = [];
    for (const link of musicianLinks) {
      const fullUrl = `https://es.wikipedia.org/${link}`;
      const data = await scrapePage(fullUrl);
      if (data) {
        musiciansData.push(data);
      }
    }

    res.json(musiciansData);
  } catch (error) {
    console.error('Error general:', error);
    res.status(500).send('Error al realizar el scraping');
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});