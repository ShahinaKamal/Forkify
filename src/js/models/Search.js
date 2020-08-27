/** Search Model */

import axios from "axios";

export default class Search {
  constructor(query) {
    this.query = query;
  }
  async getResults() {
    let queryString, response;
    try {
      queryString = `https://forkify-api.herokuapp.com/api/search?q=${this.query}`;
      response = await axios.get(queryString);
      console.log(response);
      this.result = response.data.recipes;
      console.log("SearchModel:", this.result);
    } catch (error) {
      alert(error);
    }
  }
}
