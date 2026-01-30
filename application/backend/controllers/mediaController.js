/**
 * Media Controller
 * Handles media item operations
 */

const { MediaItemModel } = require('../models');

/**
 * Get all media items for current user
 * GET /api/media
 */
async function getAllMedia(req, res) {
    try {
        const userId = req.user.id;
        const { type, watched, rating, sortBy, sortOrder } = req.query;

        const filters = {};
        if (type) filters.media_type = type;
        if (watched !== undefined) filters.watched = parseInt(watched);
        if (rating !== undefined) filters.rating = parseInt(rating);
        if (sortBy) filters.sortBy = sortBy;
        if (sortOrder) filters.sortOrder = sortOrder;

        const media = await MediaItemModel.findByUserId(userId, filters);

        res.json({
            success: true,
            data: media,
            count: media.length
        });
    } catch (err) {
        console.error('Get media error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Get media grouped by type and status
 * GET /api/media/grouped
 */
async function getGroupedMedia(req, res) {
    try {
        const userId = req.user.id;
        const grouped = await MediaItemModel.getGroupedByType(userId);

        res.json({
            success: true,
            data: grouped
        });
    } catch (err) {
        console.error('Get grouped media error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Get single media item
 * GET /api/media/:id
 */
async function getMediaById(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const media = await MediaItemModel.findById(id, userId);

        if (!media) {
            return res.status(404).json({
                success: false,
                error: 'Media item not found'
            });
        }

        res.json({
            success: true,
            data: media
        });
    } catch (err) {
        console.error('Get media by ID error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Create new media item
 * POST /api/media
 */
async function createMedia(req, res) {
    try {
        const userId = req.user.id;
        const { title, media_type, note, reason, watched, rating } = req.body;

        // Validation
        if (!title || !media_type) {
            return res.status(400).json({
                success: false,
                error: 'Title and media_type are required'
            });
        }

        const validTypes = ['movie', 'series', 'game'];
        if (!validTypes.includes(media_type)) {
            return res.status(400).json({
                success: false,
                error: `media_type must be one of: ${validTypes.join(', ')}`
            });
        }

        // Validate rating if provided
        if (rating !== undefined && (rating < 0 || rating > 3)) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 0 and 3'
            });
        }

        const media = await MediaItemModel.create(userId, {
            title,
            media_type,
            note,
            reason,
            watched: watched || 0,
            rating: rating || null
        });

        res.status(201).json({
            success: true,
            data: media
        });
    } catch (err) {
        console.error('Create media error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Update media item
 * PUT /api/media/:id
 */
async function updateMedia(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title, media_type, note, reason, rating, watched } = req.body;

        // Validate rating if provided
        if (rating !== undefined && (rating < 0 || rating > 3)) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 0 and 3'
            });
        }

        // Validate watched if provided
        if (watched !== undefined && ![0, 1].includes(watched)) {
            return res.status(400).json({
                success: false,
                error: 'watched must be 0 or 1'
            });
        }

        const updated = await MediaItemModel.update(id, userId, {
            title,
            media_type,
            note,
            reason,
            rating,
            watched
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                error: 'Media item not found'
            });
        }

        res.json({
            success: true,
            data: updated
        });
    } catch (err) {
        console.error('Update media error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Mark media as watched
 * POST /api/media/:id/watch
 */
async function markAsWatched(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { rating } = req.body;

        if (rating === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Rating is required when marking as watched'
            });
        }

        if (rating < 0 || rating > 3) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 0 and 3'
            });
        }

        const updated = await MediaItemModel.markAsWatched(id, userId, rating);

        if (!updated) {
            return res.status(404).json({
                success: false,
                error: 'Media item not found'
            });
        }

        res.json({
            success: true,
            data: updated
        });
    } catch (err) {
        console.error('Mark as watched error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Delete media item
 * DELETE /api/media/:id
 */
async function deleteMedia(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const deleted = await MediaItemModel.delete(id, userId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Media item not found'
            });
        }

        res.json({
            success: true,
            message: 'Media item deleted successfully'
        });
    } catch (err) {
        console.error('Delete media error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Get user media statistics
 * GET /api/media/stats
 */
async function getStats(req, res) {
    try {
        const userId = req.user.id;
        const stats = await MediaItemModel.getStats(userId);

        res.json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Search media items
 * GET /api/media/search?q=query
 */
async function searchMedia(req, res) {
    try {
        const userId = req.user.id;
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }

        const results = await MediaItemModel.search(userId, q);

        res.json({
            success: true,
            data: results,
            count: results.length
        });
    } catch (err) {
        console.error('Search media error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

module.exports = {
    getAllMedia,
    getGroupedMedia,
    getMediaById,
    createMedia,
    updateMedia,
    markAsWatched,
    deleteMedia,
    getStats,
    searchMedia
};
