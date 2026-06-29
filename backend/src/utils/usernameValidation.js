const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 24;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

const USERNAME_RULE_MESSAGE =
    "Username must be 3-24 characters and use only letters, numbers, underscores, or hyphens.";

const validateUsername = (value) => {
    const normalized = String(value ?? "").trim();

    if (!normalized) {
        return { valid: false, message: "Username is required" };
    }

    if (normalized.length < USERNAME_MIN_LENGTH || normalized.length > USERNAME_MAX_LENGTH) {
        return {
            valid: false,
            message: `Username must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters long`,
        };
    }

    if (!USERNAME_REGEX.test(normalized)) {
        return {
            valid: false,
            message: USERNAME_RULE_MESSAGE,
        };
    }

    return { valid: true, normalized };
};

module.exports = {
    USERNAME_MIN_LENGTH,
    USERNAME_MAX_LENGTH,
    USERNAME_REGEX,
    USERNAME_RULE_MESSAGE,
    validateUsername,
};
