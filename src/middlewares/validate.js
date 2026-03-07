const { z } = require('zod');

function validate(schema, source = 'query') {
  return (req, _res, next) => {
    const parsed = schema.parse(req[source]);
    req[source] = parsed;
    next();
  };
}

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().max(200).default(1),
});

module.exports = { validate, paginationSchema };
