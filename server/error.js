module.exports.NotFound = class NotFoundError extends Error {
  constructor(message) {
    super(message); this.name = 'NotFound';
  }
};

module.exports.Exists = class Exists extends Error {
  constructor(message) {
    super(message); this.name = 'Exists';
  }
};
