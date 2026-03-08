import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validate } from '../../middlewares/validate.js';
import { MasstamilanController } from '../../controllers/masstamilan.controller.js';
import {
  movieListQuerySchema,
  slugParamSchema,
  songParamSchema,
  autocompleteQuerySchema,
  resolveDownloadQuerySchema,
} from '../../validators/masstamilan.validators.js';

const router = Router();
const controller = new MasstamilanController();

router.get('/movies', validate(movieListQuerySchema, 'query'), asyncHandler(controller.listMovies));
router.get('/movies/:slug', validate(slugParamSchema, 'params'), asyncHandler(controller.getAlbum));
router.get(
  '/movies/:slug/songs',
  validate(slugParamSchema, 'params'),
  asyncHandler(controller.getAlbumSongs),
);
router.get(
  '/songs/:movieId/:songSlug',
  validate(songParamSchema, 'params'),
  asyncHandler(controller.getSong),
);
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

export default router;
