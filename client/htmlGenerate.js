const handlebars = require('./handlebars.js');
const bulk = require('bulk-require');
const error = require('./error.js');

// get all available pages
let pages = bulk(__dirname, ['pages/**/*.js']).pages;

async function getController(page) {
  let pageComponents = page.split(/\/(.+)/);
  page = pageComponents[0];

  if (pages[page] === undefined) {
    throw new error.NotFound(`Page ${page} not found`);
  }

  let Model = pages[page].model;
  let Controller = pages[page].controller;

  let model = new Model();
  let controller = new Controller();

  model.setController(controller);
  controller.setModel(model);

  let subpage = pageComponents[1];
  let validSubPage = await controller.setSubPage(subpage);
  if (!validSubPage) {
    throw new error.NotFound(`Subpage ${subpage} of page ${page} not found`);
  }

  // init
  await controller.init();

  return controller;
}

async function getContent(page, noHtml = false) {
  page = parsePage(page);

  let controller = await getController(page);

  let viewHTML = "";
  if (!noHtml) {
    viewHTML = await controller.getHtml();
  }

  return { html: viewHTML, controller: controller };
}

async function get(page) {
  page = parsePage(page);

  let [content, pageTemplate] = await Promise.all([
    getContent(page),
    handlebars.load('index')
  ]);
  let controller = content.controller;

  let pageHTML = pageTemplate({
    title: controller.getTitle(),
    h1: controller.getHeading(),
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
