import { elements } from "./base";
export const getInput = () => elements.searchInput.value;

const createButton = (type, page) => {
  const button = `<button class="btn-inline results__btn--${type}" data-goto=${page}>
                    <span>Page ${page}</span>
                    <svg class="search__icon">
                        <use href="img/icons.svg#icon-triangle-${
                          type === "prev" ? "left" : "right"
                        }"></use>
                    </svg>
                    
                </button>
             `;
  return button;
};
const renderButton = (page, totalPages) => {
  let button;
  if (page === 1) {
    //display only  button for next page
    button = createButton("next", page + 1);
  } else if (page > 1 && page < totalPages) {
    //display both prev and next button
    button = `${createButton("prev", page - 1)}  ${createButton(
      "next",
      page + 1
    )}`;
  } else if (page === totalPages) {
    //display only button to show previous page
    button = createButton("prev", page - 1);
  }

  elements.searchResPages.insertAdjacentHTML("afterbegin", button);
};
export const renderResults = (recipes, page = 1, recipePerPage = 10) => {
  console.log(recipes, page);

  const start = recipePerPage * (page - 1);
  const end = page * recipePerPage;
  const totalPages = Math.ceil(recipes.length / recipePerPage);
  //Show the per page results
  recipes.slice(start, end).forEach((recipe) => renderRecipe(recipe));
  //render pagination buttons based on page no.s
  renderButton(page, totalPages);
};

export const clearInput = () => {
  elements.searchInput.value = "";
};

export const clearResults = () => {
  elements.searchResList.innerHTML = "";
  elements.searchResPages.innerHTML = "";
};
export const highlightSelected = (id) => {
  const resultsArr = Array.from(document.querySelectorAll(".results__link"));
  resultsArr.forEach((result) =>
    result.classList.remove("results__link--active")
  );
  document
    .querySelector(`.results__link[href*="${id}"]`)
    .classList.add("results__link--active");
};
export const limitRecipeTitle = (title, limit = 17) => {
  const newTitle = [];
  if (title.length > limit) {
    const words = title.split(" ");
    words.reduce((acc, curr) => {
      if (acc + curr.length <= limit) {
        newTitle.push(curr);
      }
      return acc + curr.length;
    }, 0);
    return `${newTitle.join(" ")}...`;
  }
  return title;
};
//Private to this module
const renderRecipe = (recipe) => {
  //  console.log(recipe);
  const markup = `
    <li>
                    <a class="results__link" href="#${recipe.recipe_id}">
                        <figure class="results__fig">
                            <img src="${recipe.image_url}" alt="Test">
                        </figure>
                        <div class="results__data">
                            <h4 class="results__name">${limitRecipeTitle(
                              recipe.title
                            )}</h4>
                            <p class="results__author">${recipe.publisher}</p>
                        </div>
                    </a>
                </li>
    `;
  elements.searchResList.insertAdjacentHTML("beforeend", markup);
};
