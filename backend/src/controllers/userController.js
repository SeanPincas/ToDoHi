const bcrypt = require("bcryptjs");
const User = require("../models/userModel.js");

// --------------------------- UPDATE USER PREFERENCE ---------------------------
exports.updatePreference = async (req, res) => {
    try {
        const { resetHour, dayTaskDelete, theme, quoteCategory, bookmarkStyle, wallpaperStyle } = req.body;

        const updatePayload = {};

        // ---------------- preference fields ----------------
        if (resetHour !== undefined) {
            updatePayload["preference.resetHour"] = resetHour;
        }

        if (dayTaskDelete !== undefined) {
            // Applies only to newly archived tasks.
            // Existing TaskArchive records keep their already assigned
            // retentionDeleteAt value for predictable retention behavior.
            updatePayload["preference.dayTaskDelete"] = dayTaskDelete;
        }

        if (theme !== undefined) {
            updatePayload["preference.theme"] = theme;
        }

        if (bookmarkStyle !== undefined) {
            updatePayload["preference.bookmarkStyle"] = bookmarkStyle;
        }

        if (wallpaperStyle !== undefined) {
            updatePayload["preference.wallpaperStyle"] = wallpaperStyle;
        }

        if (quoteCategory !== undefined) {
            updatePayload["preference.quoteCategory"] = quoteCategory;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updatePayload,
            { new: true, runValidators: true }
        );

        // if no user was found (just in case)
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "Preferences updated successfully", user: updatedUser })
        
    } catch (err) {
        res.status(500).json({ message: "Error Updating Preferences", error: err.message })
    }
}

// --------------------------- UPDATE USER PROFILE PICTURE ---------------------------
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No File Uploaded" })
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { profilePicture: `/uploads/${req.file.filename}` },
            { new: true }
        )

        res.json({ message: "Profile Picture Updated", user: updatedUser })
    } catch (err) {
        res.status(500).json({ message: "Error Uploading Profile Picture", error: err.message })
    }
}

// --------------------------- UPDATE USER PROFILE ---------------------------
exports.updateProfile = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username || !String(username).trim()) {
            return res.status(400).json({ message: "Username is required" });
        }

        const normalizedUsername = String(username).trim();

        const existingUser = await User.findOne({
            username: normalizedUsername,
            _id: { $ne: req.user._id },
        });

        if (existingUser) {
            return res.status(400).json({ message: "Username already taken" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { username: normalizedUsername },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: "Error Updating Profile", error: err.message });
    }
};

// --------------------------- CHANGE USER PASSWORD ---------------------------
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new password are required" });
        }

        if (newPassword.length < 8 || newPassword.length > 16) {
            return res.status(400).json({
                message: "Password must be between 8 and 16 characters",
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: "New password must be different from current password",
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error Changing Password", error: err.message });
    }
};
