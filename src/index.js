import dotenv from "dotenv/config";
import { Scraper } from "./utils/Scraper.js";

const URL = process.env.URL;

const products = [];
// Instantiate a new scraper with the maxPrice of 100000
const scraper = new Scraper(URL ,100000);

// Get the products in the lower half of the price range:
await scraper.getFirstHalf(products);

// If we didn't get all the products in the first half:
if (!scraper.targetLength === products.length) {
    // Get the products in the higher half of the price range:
    await scraper.getSecondHalf(products);
}
