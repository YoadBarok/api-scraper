import axios from "axios";
import _ from "lodash";

export class Scraper {

    constructor() {
        // A map for quick checking if a product is already added.
        this.productMap = {};
        // This will be set to the 'total' attribute's value from the initial response.
        this.targetLength;
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
        if (!this.targetLength) {
            this.targetLength = answer.data.total
        }
        return answer.data;
    }

    /*
    Takes data: object - the response from the scrape function, arr - array, 
    and adds the products from data to the given array.
    */
    consumeResponse(data, arr) {
        /*
        For each product, check if it has a key in the productMap, 
        if not create an entry, and push the product to the array.
        */
        data.products.forEach(product => {
            if (!this.productMap[product.id]) {
                this.productMap[product.id] = 1;
                arr.push(product);
            }
        })
    }

    /*
    Takes arr: array, and makes calls to the API until the length of arr equals to the targetLength.
    */
    async fillProductsArray(arr) {
        // Keep making requests until the products array contains all products
        while (arr.length < this.targetLength) {
            // set minPrice to the price of the currently most expensive product in the array - 1.
            let minPrice = this.getHighestPrice(arr) - 1;
            let data = await this.scrape(URL, { minPrice: minPrice });
            this.consumeResponse(data, arr);
        }
    }

    /*
    Takes arr: array, and returns the price of the most expensive item in that array
    */
    getHighestPrice(arr) {
        return _.maxBy(arr, 'price').price;
    }

}