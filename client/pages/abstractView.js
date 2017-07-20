const handlebars = require('../handlebars.js');

class View {
  setPresenter(presenter) {
    this.presenter = presenter;
  }

  getTitle() {
    if (this.title == undefined) { throw Error("this.title not defined"); }

    return `nextAUR - ${this.title}`;
  }

  getHeading() {
    if (this.heading == undefined) { throw Error("this.heading not defined"); }

    return this.heading;
  }

  async getHtml(external) {
    if (this.template == undefined) { throw Error("this.template not defined"); }
    if (this.templateValues == undefined) { throw Error("this.templateValues not defined"); }

    let template = await handlebars.load(this.template, external);
    return template(this.templateValues);
  }

  init() {
    return;
  }
}

module.exports = View;
