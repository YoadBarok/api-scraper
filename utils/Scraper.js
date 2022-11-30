import axios from "axios";
import _ from "lodash";

export class Scraper {

    constructor() {
        // The array that will contain the products.
        this.products = [];
        // A map for quick checking if a product is already added.
        this.productMap = {};
        // Will be set to the "total" attribute of the response after the first call to the API.
        this.targetLength = 0;
    }

    /*
    Takes url: string, params: object, and returns the data from the API call.
    */
    async scrape(url, params) {
        const answer = await axios.get(url, {
            params: params
        });
        // Sort the products in the response by price in ascending order.
        // UNLESS: this is already done by the API before sending the response. 
        answer.data.products = _.sortBy(answer.data.products, "price");
        return answer.data;
    }

    /*
    Takes data: object - the response from the scrape function, and adds the products to the products array.
    */
    consumeResponse(data) {
        /*
        For each product, check if it has a key in the productMap, 
        if not create a key, and push the product to the array.
        */ 
        data.products.forEach(product => {
            if (!this.productMap[product.id]) {
                this.productMap[product.id] = 1;
                this.products.push(product);
            }
        })
    }

    /*
    Takes arr: array, and returns the price of the most expensive item in that array
    */
    getHighestPrice(arr) {
        return _.maxBy(arr, 'price').price;
    }
    
}