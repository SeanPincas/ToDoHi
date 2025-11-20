const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');

module.exports = async (req, res, next ) => {
    const header = req.headers.authorization;

    if (!header) return res.status(401).json({ message: "No Token Provided"});

    const token = header.split(' ')[1]; // remove "Bearer"
    try {
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Find User
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: "Invalid User"});

        // Attach User to request object
        req.user = user;
        next(); // move to next route

    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
}