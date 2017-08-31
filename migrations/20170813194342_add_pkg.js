exports.up = function (knex) {
  return knex.schema.createTable('packages', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.integer('remoteId').notNullable();
    table.string('description').notNullable();
    table.string('version').notNullable();
    table.string('downloadUrl').notNullable();
    table.integer('repoId').notNullable();
    table.string('status');
    table.string('containerId');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('packages');
};
