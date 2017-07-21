const handlebars = require('../handlebars.js');

class Controller {
  setModel(model) {
    this.model = model;
  }

  async init() {
    return;
  }

  async initEvents() {
    return;
  }

  /**
    * Set the subpage to given value. Will not allow any sub page by default and cause a 404
    *
    * @param  {String} subpage  the sub page including all slashes
    * @return {Bool}            True if this sub page is valid, False otherwise
    */
  async setSubPage(subpage) {
    if (subpage === undefined) {
      return true;
    }
    return false;
  }

  getTitle() {
    if (this.title == undefined) { throw Error("this.title not defined"); }

    return `nextAUR - ${this.title}`;
  }

  getHeading() {
    if (this.heading == undefined) { throw Error("this.heading not defined"); }

    return this.heading;
  }

  async getHtml(external, server = false) {
    if (this.templateName == undefined) { throw Error("this.templateName not defined"); }
    if (this.templateValues == undefined) { throw Error("this.templateValues not defined"); }

    let template = await handlebars.load(this.templateName, external);
    return template(this.templateValues);
  }
}

module.exports = Controller;
