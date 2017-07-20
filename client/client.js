const html = require('./htmlGenerate');

async function getPage(page, replace) {
  console.log(`get Page ${page}`);

  let content = await html.getContent(page);

  document.title = content.presenter.getView().getTitle();
  document.getElementById("h1").innerHTML = content.presenter.getView().getHeading();
  document.getElementById("content").innerHTML = content.html;

  // init view
  await content.presenter.getView().init();

  if (replace) {
    history.replaceState(page, "", page);
  }
  else {
    history.pushState(page, "", page);
  }

  setLinks(document.getElementById("content"));
}

function setLinks(target) {
  let links = target.querySelectorAll('[data-role=ajax]');
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

setLinks(document);

// reload this page
getPage(location.pathname, true);

// set getPage() to be global
global._getPage = getPage;
