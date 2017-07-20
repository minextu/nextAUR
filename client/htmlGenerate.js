const handlebars = require('./handlebars.js');
const bulk = require('bulk-require');
const error = require('./error.js');

// get all available pages
let pages = bulk(__dirname, ['pages/**/*.js']).pages;

function getPresenter(page) {
  if (pages[page] === undefined) {
    throw new error.NotFound(`Page ${page} not found`);
  }

  let Model = pages[page].model;
  let Presenter = pages[page].presenter;
  let View = pages[page].view;

  let model = new Model();
  let presenter = new Presenter();
  let view = new View();

  model.setPresenter(presenter);
  view.setPresenter(presenter);
  presenter.setView(view);
  presenter.setModel(model);
  view.init();

  return presenter;
}

async function getContent(page, external = true) {
  page = parsePage(page);

  let presenter = getPresenter(page);
  let viewHTML = await presenter.getView().getHtml(external);

  return { html: viewHTML, presenter: presenter };
}

async function get(page, external = true) {
  page = parsePage(page);

  let [content, pageTemplate] = await Promise.all([
    getContent(page, external),
    handlebars.load('index', external)
  ]);
  let presenter = content.presenter;

  let pageHTML = pageTemplate({
    title: presenter.getView().getTitle(),
    h1: presenter.getView().getHeading(),
    content: content.html
  });

  return pageHTML;
}

function parsePage(page) {
  if (page === "" || page === null || page === "/") {
    page = "/repoList";
  }

  // remove slash
  page = page.replace(/^\//, "").replace(/\/$/, "");
  return page;
}

module.exports.get = get;
module.exports.getContent = getContent;
