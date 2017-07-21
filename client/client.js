const html = require('./htmlGenerate');

async function getPage(page, replace = false, noHtml = false) {
  console.log(`get Page ${page}`);

  let content = await html.getContent(page, noHtml);

  if (!noHtml) {
    document.title = content.presenter.getView().getTitle();
    document.getElementById("h1").innerHTML = content.presenter.getView().getHeading();
    document.getElementById("content").innerHTML = content.html;
  }

  // init events
  await content.presenter.getView().initEvents();
  await content.presenter.initEvents();

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
getPage(location.pathname, true, true);

// set getPage() to be global
global._getPage = getPage;
