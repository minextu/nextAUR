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

  async init() {
    return;
  }
}

module.exports = Presenter;
