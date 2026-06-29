export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 24;
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export const USERNAME_RULE_MESSAGE =
    "Username must be 3-24 characters and use only letters, numbers, underscores, or hyphens.";

type UsernameValidationResult =
    | { valid: true; normalized: string }
    | { valid: false; message: string };

export const validateUsername = (value: string): UsernameValidationResult => {
    const normalized = value.trim();

    if (!normalized) {
        return {
            valid: false,
            message: "Username is required.",
        };
    }

    if (normalized.length < USERNAME_MIN_LENGTH || normalized.length > USERNAME_MAX_LENGTH) {
        return {
            valid: false,
            message: `Username must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters.`,
        };
    }

    if (!USERNAME_REGEX.test(normalized)) {
        return {
            valid: false,
            message: USERNAME_RULE_MESSAGE,
        };
    }

    return {
        valid: true,
        normalized,
    };
};
