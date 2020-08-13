// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    }
  };
}
// Init http module
const http = customHttp();

//News servise
const newsService = (function() {
  const apiKey = "f01730b4ec3c42c5924d372fb5578310";
  const apiUrl = "http://newsapi.org/v2";

  return {
    topHedlines(countru = "ua", cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${countru}&category=technology&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    }
  };
})();

//Elements

const form = document.forms["newsControls"];
const countrySelect = form.elements["country"];
const searchInput = form.elements["search"];

//Events

form.addEventListener("submit", e => {
  e.preventDefault();
  loadNews();
});

//  init selects
document.addEventListener("DOMContentLoaded", function() {
  M.AutoInit();
  loadNews();
});

//Load news funcion
function loadNews() {
  showLoader();
  const country = countrySelect.value;
  const search = searchInput.value;

  if (!search) {
    newsService.topHedlines(country, onGetResponse);
  } else {
    newsService.everything(search, onGetResponse);
  }
}

// Function on get response on server
function onGetResponse(err, res) {
  removeLoader();
  if (err) {
    showAlert(err, "error-msg");
    return;
  }

  if (!res.articles.length) {
    //! Show empty news
    let textMsg = `No news found for "${searchInput.value}"`;
    showModal(textMsg, "");
    return;
  }

  renderNews(res.articles);
}

//Function render news
function renderNews(news) {
  const newsContainer = document.querySelector(".news-container .row");

  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }

  let fragment = "";
  news.forEach(item => {
    const element = newsTemplate(item);
    fragment += element;
  });

  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}

//Function clear container
function clearContainer(container) {
  container.innerHTML = "";
}

//News item template function
function newsTemplate(item) {
  const nullImage =
    "https://lh6.ggpht.com/I9oxpPauHw6pTPP4d_5VuQZTkh-nRI90vdo62ws-0_bbBPEjwkDyNlgu1wpaVNxiaFJh";

  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${item.urlToImage || nullImage}" alt="Картинки нет">
          <span class="card-title">${item.title || ""}</span>
        </div>
        <div class="card-content">
          <p>${item.description || ""}</p>
        </div>
        <div class="card-action">
          <a href="${item.url}">Read more</a>
        </div>
      </div>
    </div>
  `;
}

function showAlert(msg, type) {
  M.toast({ html: msg, classes: type });
}

//* Show loader
function showLoader() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
      <div class="progress">
        <div class="indeterminate"></div>
      </div>
  `
  );
}

//* Remove loadre
function removeLoader() {
  const loader = document.querySelector(".progress");

  if (loader) {
    loader.remove();
  }
}

//* Show modal
function showModal(header, text) {
  const modal = document.querySelector(".modal");
  const instances = M.Modal.init(modal);
  modal.querySelector("h4").textContent = header;

  modal.querySelector("p").textContent = text;

  instances.open();
}
