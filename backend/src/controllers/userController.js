const User = require("../models/userModel.js");

// --------------------------- UPDATE USER PREFERENCE ---------------------------
exports.updatePreference = async (req, res) => {
    try {
        const { resetHour, dayTaskDelete, theme, quoteCategory } = req.body;

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
