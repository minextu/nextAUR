const AbstractPresenter = require("../abstractPresenter");

class Presenter extends AbstractPresenter {
  async submit(name) {
    let answer = await this.model.createRepo(name);
    if (answer.error !== undefined) {
      this.view.showError(new Error(answer.error));
    }
    else {
      _getPage('repoList');
    }
  }
}

module.exports = Presenter;
