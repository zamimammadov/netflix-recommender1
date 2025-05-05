new autoComplete({
  data: { src: films },
  selector: "#autoComplete",
  threshold: 2,
  debounce: 100,
  searchEngine: "strict",
  resultsList: {
    render: true,
    container: source => source.setAttribute("id", "food_list"),
    destination: document.querySelector("#autoComplete"),
    position: "afterend",
    element: "ul"
  },
  maxResults: 5,
  highlight: true,
  resultItem: {
    content: (data, source) => { source.innerHTML = data.match; },
    element: "li"
  },
  noResults: () => {
    const result = document.createElement("li");
    result.className = "no_result";
    result.tabIndex = 1;
    result.innerHTML = "No Results";
    document.querySelector("#autoComplete_list").appendChild(result);
  },
  onSelection: feedback => {
    const input = document.getElementById("autoComplete");
    input.value = feedback.selection.value.trim();

    const button = document.querySelector(".movie-button");
    button.disabled = false;

    button.click();
  }
});
