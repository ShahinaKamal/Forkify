import Search from "./models/Search";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from "./views/base";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};
window.state = state;
/** Search Controller */
const controlSearch = async () => {
  //1.Get the search input from UI

  const query = searchView.getInput();
  //console.log(query);

  if (query) {
    // 2) New search object and add to state
    state.search = new Search(query);
    // 3) Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);
    try {
      // 4) Search for recipes
      await state.search.getResults();
      //5)Render the results in UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {
      console.log(error);
    }
  }
};

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    console.log(`Next Page -> ${goToPage}`);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/** Recipe Controller */

const controlRecipe = async () => {
  const id = window.location.hash.replace("#", "");
  if (id) {
    //Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //Highlight selected search item
    if (state.search) searchView.highlightSelected(id);
    //create new recipe object
    state.recipe = new Recipe(id);
    //Get recipe data

    //TESTING
    //window.r = state.recipe;

    try {
      //Get recipe and parseIngredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      //Calculate servings and time
      state.recipe.calcServings();
      state.recipe.calcCookingTime();

      //Update UI and render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, true);
    } catch (error) {
      console.log("error processing recipe", error);
    }
  }
};

// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);

/***Replace above two lines with simplified code*/

["hashchange", "load"].forEach((eventType) =>
  window.addEventListener(eventType, controlRecipe)
);

//Shopping List Controller
const controlList = () => {
  //create alist if there is no list created yet
  if (!state.list) {
    state.list = new List();
  }
  //Add eachingredient to the list
  state.recipe.ingredients.forEach((el) => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    console.log(item);
    listView.renderItem(item);
  });
};

//Handle delete and update shopping list item
elements.shopping.addEventListener("click", (e) => {
  const id = e.target.closest(".shopping__item").dataset.itemid;
  //handle delete event

  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    //delete from state and UI
    state.list.deleteItem(id);
    listView.deleteItem(id);
  } else if (e.target.matches(".shopping__count--value")) {
    const val = parseFloat(e.target.value, 10);
    console.log("val", val);
    state.list.updateCount(id, val);
  }
});

/**
 * LIKE CONTROLLER
 */
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  // User has NOT yet liked current recipe
  if (!state.likes.isLiked(currentID)) {
    // Add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    // Toggle the like button
    likesView.toggleLikeBtn(true);

    // Add like to UI list
    likesView.renderLike(newLike);

    // User HAS liked current recipe
  } else {
    // Remove like from the state
    state.likes.deleteLike(currentID);

    // Toggle the like button
    likesView.toggleLikeBtn(false);

    // Remove like from UI list
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener("load", () => {
  state.likes = new Likes();

  // Restore likes
  state.likes.readStorage();

  // Toggle like menu button
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  // Render the existing likes
  state.likes.likes.forEach((like) => likesView.renderLike(like));
});

//Handling servings increase or decrease button click
elements.recipe.addEventListener("click", (e) => {
  console.log("update servings");
  //When decrease button is clicked

  if (e.target.matches(".btn-decrease ,.btn-decrease *")) {
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredient(state.recipe);
    }
  }
  //When increase button is clicked
  else if (e.target.matches(".btn-increase, .btn-increase *")) {
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredient(state.recipe);
  } else if (e.target.matches(".recipe__btn--add,.recipe__btn--add *")) {
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    // Like controller
    controlLike();
  }
});

//Testing
window.l = new List();
