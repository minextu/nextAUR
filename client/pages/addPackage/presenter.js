const AbstractPresenter = require("../abstractPresenter");

class Presenter extends AbstractPresenter {
  async setSubPage(subpage) {
    if (!subpage) { return false; }

    this.model.setRepo(subpage);
    return true;
  }

  async submit(name) {
    let answer = await this.model.addPackage(name);
    if (answer.error !== undefined) {
      this.view.showError(new Error(answer.error));
    }
    else {
      _getPage('packageList/' + this.model.getRepo());
    }
  }
}

module.exports = Presenter;
