const MediaItem = require('../models/MediaItem');

// Default user ID for single-user mode
const DEFAULT_USER_ID = 'default-user';

// Map frontend media types to database media_type_id
const mediaTypeMap = {
    'movie': 1,
    'movies': 1,
    'serie': 2,
    'series': 2,
    'tv': 2,
    'game': 3,
    'games': 3
};

// Map database media_type_id to frontend media_type string
const mediaTypeIdToName = {
    1: 'movie',
    2: 'series',
    3: 'game'
};

const mediaController = {
    async create(req, res) {
        try {
            const { 
                title, 
                media_type, 
                note, 
                rating,
                reason 
            } = req.body;

            if (!title) {
                return res.status(400).json({ error: 'Title is required' });
            }

            // Normalize media_type to get media_type_id
            const normalizedMediaType = mediaTypeMap[media_type?.toLowerCase()] || 1;
            
            // Convert status to watched (0 or 1)
            // Frontend sends: 'watched' or 'to_watch' in status field
            // Database uses: watched (0 or 1)
            const watched = req.body.status === 'watched' ? 1 : 0;

            const mediaItem = await MediaItem.create({
                user_id: req.user.id,
                title,
                media_type_id: normalizedMediaType,
                note: note || null,
                reason: reason || null,
                rating: rating || null,
                watched: watched,
                poster_url: req.body.poster_url || null
            });

            res.status(201).json({
                message: 'Media item created successfully',
                mediaItem
            });
        } catch (err) {
            console.error('Create media error:', err);
            res.status(500).json({ error: 'Failed to create media item' });
        }
    },

    async getAll(req, res) {
        try {
            const { media_type, search } = req.query;

            // Build filter options
            const options = {
                search: search || null
            };

            // Filter by media type if provided
            if (media_type) {
                const mediaTypeId = mediaTypeMap[media_type.toLowerCase()];
                if (mediaTypeId) {
                    options.mediaTypeId = mediaTypeId;
                }
            }

            const items = await MediaItem.findByUser(req.user.id, options);

            // Map media_type_id back to string for frontend
            const mappedItems = items.map(item => ({
                ...item,
                media_type: mediaTypeIdToName[item.media_type_id] || 'movie'
            }));

            res.json(mappedItems);
        } catch (err) {
            console.error('Get all media error:', err);
            res.status(500).json({ error: 'Failed to get media items' });
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;

            const mediaItem = await MediaItem.findById(id);
            
            if (!mediaItem) {
                return res.status(404).json({ error: 'Media item not found' });
            }

            // Map media_type_id back to string for frontend
            const mappedItem = {
                ...mediaItem,
                media_type: mediaTypeIdToName[mediaItem.media_type_id] || 'movie'
            };

            res.json(mappedItem);
        } catch (err) {
            console.error('Get media by ID error:', err);
            res.status(500).json({ error: 'Failed to get media item' });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { rating, note, status } = req.body;

            // Build update data
            const updateData = {};
            
            if (rating !== undefined) {
                updateData.rating = rating;
            }
            
            if (note !== undefined) {
                updateData.note = note;
            }
            
            if (status !== undefined) {
                updateData.watched = status === 'watched' ? 1 : 0;
            }

            const success = await MediaItem.update(id, updateData);
            
            if (!success) {
                return res.status(404).json({ error: 'Media item not found' });
            }

            const updated = await MediaItem.findById(id);
            res.json({
                message: 'Media item updated successfully',
                mediaItem: updated
            });
        } catch (err) {
            console.error('Update media error:', err);
            res.status(500).json({ error: 'Failed to update media item' });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;

            const success = await MediaItem.delete(id, req.user.id);
            
            if (!success) {
                return res.status(404).json({ error: 'Media item not found' });
            }

            res.json({ message: 'Media item deleted successfully' });
        } catch (err) {
            console.error('Delete media error:', err);
            res.status(500).json({ error: 'Failed to delete media item' });
        }
    }
};

module.exports = mediaController;
