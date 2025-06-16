const express = require('express');
const docsController = require('../controllers/docsController');
const router = express.Router();

/**
 * @route   GET /api/docs
 * @desc    Affiche la documentation de l'API
 */
router.get('/', docsController.showDocs);

module.exports = router;