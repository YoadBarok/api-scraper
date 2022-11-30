import dotenv from "dotenv/config";
import { Scraper } from "./utils/Scraper.js";

const URL = process.env.URL;

const products = [];
const scraper = new Scraper();

// Get the data from the initial response.
const data = await scraper.scrape(URL, { minPrice: 0 });
scraper.consumeResponse(data, products);

// Set the targetLength attribute of the scraper based on the total attribute of the initial response.
scraper.targetLength = data.total;

// Fill the products array with all products from the API.
await scraper.fillProductsArray(products);

