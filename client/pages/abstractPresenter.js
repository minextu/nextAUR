class Presenter {
  setView(view) {
    this.view = view;
  }

  setModel(model) {
    this.model = model;
  }

  getView() {
    return this.view;
  }

  async init() {
    return;
  }
}

module.exports = Presenter;
