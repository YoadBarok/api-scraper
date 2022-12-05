import axios from "axios";
import _ from "lodash";

export class Scraper {

    // Takes url: string - the url of the target api , maxPrice:number - the highest possible price for an item in the API we are scraping
    constructor(url, maxPrice) {
        // A map for quick checking if a product is already added.
        this.productMap = {};
        // This will be set to the 'total' attribute's value from the initial response.
        this.targetLength;
        this.url = url;
        this.maxPrice = maxPrice;
    }

    /*
    Takes params: object, and returns the data from the API call.
    */
    async scrape(params) {
        const answer = await axios.get(this.url, {
            params: params
        });
        // If not already set, set this.targetLength to the total amount of products in the API's db.
        if (!this.targetLength) {
            this.targetLength = answer.data.total;
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
            };
        });
    }

    /*
    Takes arr: array, fills the given array with the products in the first half of the API's price range (0 to maxPrice / 2).
    */
    async getFirstHalf(arr) {

        // In the first iteration the minPrice is 0, and the maxPrice is half of this.maxPrice
        let minPrice = 0;
        let maxPrice = this.maxPrice / 2;

        let data = await this.scrape({ minPrice: minPrice, maxPrice: maxPrice });
        // If all the items were in that range, add them all to the array.
        if (data.total === data.count) {
            this.consumeResponse(data, arr);
        }
        // Else start a binary search on the entire lower half of the price range:
        else {
            // First cut the maxPrice by half
            maxPrice /= 2;
            await this.binarySearchRange(true, arr, minPrice, maxPrice, data)
        }
    }

    /*
    Takes arr: array, fills the given array with the products in the second half of the API's price range (maxPrice / 2 + 1 to maxPrice).
    */
    async getSecondHalf(arr) {

        // Starting from half of this.maxPrice + 1:
        let minPrice = this.maxPrice / 2 + 1;
        let maxPrice = this.maxPrice;

        let data = await this.scrape({ minPrice: minPrice, maxPrice: maxPrice });
        // If we got all the remaining items in this response, add them all to the array.
        if (data.count + arr.length === this.targetLength) {
            this.consumeResponse(data, arr);
        }
        // Else start a binary search on the entire higher half of the price range:
        else {
            // First cut the maxPrice by half
            maxPrice /= 2;
            await this.binarySearchRange(false, arr, minPrice, maxPrice, data)
        }
    }

    /*
    Takes isFirstHalf: boolean, arr: array, minPrice: number, maxPrice: number, data: object
    and adds all the products in the given price range to the array.
    */
    async binarySearchRange(isFirstHalf, arr, minPrice, maxPrice, data) {

        /*
        Takes bottom: number, top: number, and returns the new desired value for maxPrice.
        */
        const binarySearchMaxPrice = (bottom, top) => {
            return ((top - bottom) / 2) + bottom;
        }

        /* 
        First condition is based on isFirstHalf:
        case true: check if maxPrice is less than half of this.maxPrice,
        case false: check if maxPrice is smaller than this.maxPrice, 
        the second condition is that the response has 1000 products.
        */
        while ((isFirstHalf ? maxPrice < this.maxPrice / 2 : maxPrice < this.maxPrice) && data.count === 1000) {
            while (data.count === 1000) {
                maxPrice = binarySearchMaxPrice(minPrice, maxPrice);
                data = await this.scrape({ minPrice: minPrice, maxPrice: maxPrice })
            }
            // The count is less than 1000 => that range is cleared so we consume the response
            this.consumeResponse(data, arr);
            // The new minPrice is the current maxPrice
            minPrice = maxPrice;

            // maxPrice is doubled unless doubling it results in a higher value than needed in this half.
            if (isFirstHalf) {
                maxPrice = maxPrice * 2 > this.maxPrice / 2 ? this.maxPrice / 2 : maxPrice * 2;
            } else {
                maxPrice = maxPrice * 2 > this.maxPrice ? this.maxPrice : maxPrice * 2;
            }
            data = await this.scrape({ minPrice: minPrice, maxPrice: maxPrice })
        }
        // Add the products to the array one last time after breaking from the loop.
        this.consumeResponse(data, arr);
    }

}