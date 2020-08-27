import axios from "axios";

export default class Recipe {
  constructor(id) {
    this.id = id;
  }
  async getRecipe() {
    try {
      const res = await axios.get(
        `https://forkify-api.herokuapp.com/api/get?rId=${this.id}`
      );
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (error) {
      console.log(error);
    }
  }
  calcServings() {
    this.servings = 4; //Just assume
  }
  calcCookingTime() {
    //Assume that we need 15 minutes for each 3 ingredients
    this.time = Math.ceil(this.ingredients.length / 3) * 15;
  }
  parseIngredients() {
    const unitsLong = [
      "tablespoons",
      "tablespoon",
      "ounces",
      "ounce",
      "teaspoons",
      "teaspoon",
      "cups",
      "pounds",
    ];
    const unitsShort = [
      "tbsp",
      "tbsp",
      "oz",
      "oz",
      "tsp",
      "tsp",
      "cup",
      "pound",
    ];
    const units = [...unitsShort, "kg", "g"];
    let count;
    // console.log("=============" + this.ingredients + "===============");
    const newIngredients = this.ingredients.map((e1) => {
      //1 . uniform units
      let ingredient = e1.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
      });
      //2.Remove Parentheses
      ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");

      //3.Parse ingredients into counts,units and ingredient name
      const arrIngr = ingredient.split(" ");
      let parsedIngObj = {
        unit: "1",
        count: "",
        ingredient,
      };
      //find units
      //1)find starting index of unit -> check if unit matches with unitsShort el
      let unitIndex = arrIngr.findIndex((el) => {
        return units.includes(el);
      });
      if (unitIndex > -1) {
        //When there is a unit
        //  console.log("unit is", arrIngr[unitIndex]);

        //finds count
        const arrCount = arrIngr.slice(0, unitIndex);
        if (arrCount === 1) {
          count = eval(arrIngr[0].replace("-", "+"));
        } else {
          //1) slice from 0 to unit index,result can be 1 tsp or 3 1/4 cup etc
          count = eval(arrCount.join("+"));
        }

        parsedIngObj = {
          count,
          unit: arrIngr[unitIndex],
          ingredient: arrIngr.slice(unitIndex + 1).join(" "),
        };
      } else if (unitIndex === -1) {
        //When there is no unit
        if (parseInt(arrIngr[0], 10)) {
          //When there is no unit but first element is number
          parsedIngObj = {
            count: parseInt(arrIngr[0], 10),
            unit: "",
            ingredient: arrIngr.slice(1).join(" "),
          };
        } else {
          //When there is no unitand no count
          parsedIngObj = {
            count: 1,
            unit: "",
            ingredient,
          };
        }
      }
      // console.log(parsedIngObj);
      return parsedIngObj;
    });
    console.log(newIngredients);
    this.ingredients = newIngredients;
  }
  updateServings(type) {
    console.log("type", type);
    // Servings
    const newServings = type === "dec" ? this.servings - 1 : this.servings + 1;

    // Ingredients
    this.ingredients.forEach((ing) => {
      ing.count *= newServings / this.servings;
    });
    console.log(this.ingredients);
    this.servings = newServings;
  }
}
