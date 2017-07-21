const AbstractPresenter = require("../abstractPresenter");

class Presenter extends AbstractPresenter {
  async setSubPage(subpage) {
    if (subpage === undefined) {
      return false;
    }
    let valid = await this.model.setRepo(subpage);
    return valid;
  }

  async init() {
    let packages = await this.model.getPackages();
    this.view.setPackages(packages);
    this.view.setRepo(this.model.getRepo());
  }

  async build(id) {
    let answer = await this.model.build(id);

    if (answer.error !== undefined) {
      this.view.showError(new Error(answer.errorText));
    }
    else {
      this.view.hideBuild(id);
    }
  }
}

module.exports = Presenter;
