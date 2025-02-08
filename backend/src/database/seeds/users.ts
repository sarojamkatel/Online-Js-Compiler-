import { Knex } from "knex";
import { ROLE } from "../../enums/role";

const TABLE_NAME = "users";

/**
 * Delete existing entries and seed values for table TABLE_NAME.
 * @param   {Knex} knex
 * @returns {Promise}
 */
export function seed(knex: Knex): Promise<void> {
  return knex(TABLE_NAME)
    .del()
    .then(() => {
      return knex(TABLE_NAME).insert([
        {
          name: "admin User",
          email: "one@gmail.com",
          password:
            "$2b$10$bCx2uxbLx7IObbO9yLo/pOX7wCCOk6SSgSmIheesP3uDMKPfy8YlW",
          role: ROLE.ADMIN,
        },
        {
          name: "normal User 1",
          email: "two@gmail.com",
          password:
            "$2b$10$bCx2uxbLx7IObbO9yLo/pOX7wCCOk6SSgSmIheesP3uDMKPfy8YlW",
          role: ROLE.USER,
        },
        {
          name: "normal User 2",
          email: "three@gmail.com",
          password:
            "$2b$10$bCx2uxbLx7IObbO9yLo/pOX7wCCOk6SSgSmIheesP3uDMKPfy8YlW",
          role: ROLE.USER,
        },
        ,
      ]);
    });
}
