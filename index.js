import dotenv from "dotenv/config";
import { Scraper } from "./utils/Scraper.js";

const URL = process.env.URL;


const scraper = new Scraper();

// Get the data from the initial response
var data = await scraper.scrape(URL, { minPrice: 0 });
scraper.consumeResponse(data);
scraper.targetLength = data.total;

// Keep making requests until the products array contains all products
while (scraper.products.length < scraper.targetLength) {
    // set minPrice to the price of the currently most expensive product in the array.
    let minPrice = scraper.getHighestPrice(scraper.products);
    data = scraper.scrape(URL, {minPrice: minPrice});
    scraper.consumeResponse(data);
}
