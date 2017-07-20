const html = require('./htmlGenerate');

async function getPage(page, replace) {
  console.log(`get Page ${page}`);

  let content = await html.getContent(page);

  document.title = content.presenter.getView().getTitle();
  document.getElementById("h1").innerHTML = content.presenter.getView().getHeading();
  document.getElementById("content").innerHTML = content.html;

  if (replace) {
    history.replaceState(page, "", page);
  }
  else {
    history.pushState(page, "", page);
  }
}

function setLinks() {
  let links = document.querySelectorAll('[data-role=ajax]');
  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener("click", (e) => {
      let page = links[i].getAttribute('href');
      getPage(page);
      e.preventDefault();
    });
  }
}

window.onpopstate = event => {
  getPage(event.state, true);
};

setLinks();
