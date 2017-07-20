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
}

module.exports = Presenter;
