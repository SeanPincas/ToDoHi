const MEMO_TITLE_MAX_LENGTH = 65;
const MEMO_CONTENT_MAX_LENGTH = 650;

function normalizeMemoTitle(value) {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeMemoContent(value) {
    return typeof value === "string" ? value.trim() : "";
}

function validateMemoLengths({ title = "", content = "" }) {
    if (title.length > MEMO_TITLE_MAX_LENGTH) {
        return `Memo title must be ${MEMO_TITLE_MAX_LENGTH} characters or fewer.`;
    }

    if (content.length > MEMO_CONTENT_MAX_LENGTH) {
        return `Memo content must be ${MEMO_CONTENT_MAX_LENGTH} characters or fewer.`;
    }

    return null;
}

module.exports = {
    MEMO_TITLE_MAX_LENGTH,
    MEMO_CONTENT_MAX_LENGTH,
    normalizeMemoTitle,
    normalizeMemoContent,
    validateMemoLengths,
};
