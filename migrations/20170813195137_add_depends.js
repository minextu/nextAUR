exports.up = function (knex) {
  return knex.schema.createTable('depends', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.integer('packageId').notNullable();
    table.integer('type');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('depends');
};
