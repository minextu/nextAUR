const handlebars = require('./handlebars.js');
const bulk = require('bulk-require');
const error = require('./error.js');

// get all available pages
let pages = bulk(__dirname, ['pages/**/*.js']).pages;

async function getPresenter(page, server) {
  let pageComponents = page.split(/\/(.+)/);
  page = pageComponents[0];

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

  let subpage = pageComponents[1];
  let validSubPage = await presenter.setSubPage(subpage);
  if (!validSubPage) {
    throw new error.NotFound(`Subpage ${subpage} of page ${page} not found`);
  }

  // do not init when html is generated on server
  if (!server) {
    await presenter.init();
  }

  return presenter;
}

async function getContent(page, server = false) {
  page = parsePage(page);

  let presenter = await getPresenter(page, server);
  let viewHTML = await presenter.getView().getHtml(server, server);

  return { html: viewHTML, presenter: presenter };
}

async function get(page, server = false) {
  page = parsePage(page);

  let [content, pageTemplate] = await Promise.all([
    getContent(page, server),
    handlebars.load('index', server)
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
