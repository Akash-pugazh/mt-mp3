const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { validate } = require('../../middlewares/validate');
const { MasstamilanController } = require('../../controllers/masstamilan.controller');
const {
  movieListQuerySchema,
  slugParamSchema,
  songParamSchema,
  autocompleteQuerySchema,
  resolveDownloadQuerySchema,
} = require('../../validators/masstamilan.validators');

const router = Router();
const controller = new MasstamilanController();

router.get('/movies', validate(movieListQuerySchema, 'query'), asyncHandler(controller.listMovies));
router.get('/movies/:slug', validate(slugParamSchema, 'params'), asyncHandler(controller.getAlbum));
router.get(
  '/movies/:slug/songs',
  validate(slugParamSchema, 'params'),
  asyncHandler(controller.getAlbumSongs),
);
router.get('/songs/:movieId/:songSlug', validate(songParamSchema, 'params'), asyncHandler(controller.getSong));
router.get(
  '/search/autocomplete',
  validate(autocompleteQuerySchema, 'query'),
  asyncHandler(controller.autocomplete),
);
router.get(
  '/download/resolve',
  validate(resolveDownloadQuerySchema, 'query'),
  asyncHandler(controller.resolveDownload),
);

module.exports = router;
