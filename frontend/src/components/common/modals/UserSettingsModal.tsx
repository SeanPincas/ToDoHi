import { useEffect, useMemo, useRef, useState } from "react";
import { Icons } from "../../../styles/iconLibrary";
import { modalOverlayStyle } from "../../../styles/modalStyles";
import {
    updateUserPreferences,
    updateUserProfile,
    uploadUserProfilePicture,
} from "../../../api/userApi";
import { useAuthContext } from "../../../context/AuthContext";
import DropdownMenu, { type DropdownOption } from "../dropdownMenu/DropdownMenu";
import type { QuoteCategory, QuoteDelayMinutes } from "../../../utils/quoteUtils";
import { QUOTE_CATEGORIES, QUOTE_DELAY_LABELS, QUOTE_DELAY_OPTIONS } from "../../../utils/quoteUtils";
import { BOOKMARK_STYLE_LABELS, BOOKMARK_STYLE_OPTIONS } from "../../../utils/bookmarkStyles";
import { DEFAULT_FRAME_STYLE, FRAME_STYLE_LABELS, FRAME_STYLE_OPTIONS } from "../../../utils/frameStyles";
import { WALLPAPER_STYLE_LABELS, WALLPAPER_STYLE_OPTIONS } from "../../../utils/wallpaperStyles";
import ThemeToggle from "../themeToggle/ThemeToggle";
import ProfilePictureCropModal from "./ProfilePictureCropModal";
import ChangePasswordModal from "./ChangePasswordModal";
import "./UserSettingsModal.css";
import "./modalBaseTheme.css";
import "./taskManagementModalTheme.css";
import "../../../styles/ButtonStyles.css";

interface Props {
    onClose: () => void;
}

const RESET_HOUR_OPTIONS: DropdownOption[] = Array.from({ length: 24 }).map((_, i) => ({
    value: String(i),
    label: `${i}:00`,
}));

const QUOTE_OPTIONS: DropdownOption[] = [
    { value: "Random", label: "Random" },
    ...QUOTE_CATEGORIES.filter((category) => category !== "Random").map((category) => ({
        value: category,
        label: category,
    })),
];

const QUOTE_DELAY_DROPDOWN_OPTIONS: DropdownOption[] = QUOTE_DELAY_OPTIONS.map((delay) => ({
    value: String(delay),
    label: QUOTE_DELAY_LABELS[delay],
}));

const BOOKMARK_OPTIONS: DropdownOption[] = BOOKMARK_STYLE_OPTIONS.map((style) => ({
    value: style,
    label: BOOKMARK_STYLE_LABELS[style] ?? style,
}));

const WALLPAPER_OPTIONS: DropdownOption[] = WALLPAPER_STYLE_OPTIONS.map((style) => ({
    value: style,
    label: WALLPAPER_STYLE_LABELS[style] ?? style,
}));

const FRAME_OPTIONS: DropdownOption[] = FRAME_STYLE_OPTIONS.map((style) => ({
    value: style,
    label: FRAME_STYLE_LABELS[style] ?? style,
}));

const getProfilePictureSrc = (profilePicture?: string) => {
    if (!profilePicture) return "/default-profile.webp";
    if (profilePicture.startsWith("http")) return profilePicture;
    return `http://localhost:3500${profilePicture}`;
};

const UserSettingsModal = ({ onClose }: Props) => {
    const { user, refreshUser, theme, toggleTheme } = useAuthContext();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [username, setUsername] = useState("");
    const [resetHour, setResetHour] = useState("0");
    const [quotePreference, setQuotePreference] = useState<string>("Random");
    const [quoteDelay, setQuoteDelay] = useState<string>("10");
    const [wallpaperStyle, setWallpaperStyle] = useState("wallpaper-1");
    const [frameStyle, setFrameStyle] = useState<string>(DEFAULT_FRAME_STYLE);
    const [bookmarkStyle, setBookmarkStyle] = useState("bookmark-1");
    const [accountMessage, setAccountMessage] = useState("");
    const [preferenceMessage, setPreferenceMessage] = useState("");
    const [accountError, setAccountError] = useState("");
    const [preferenceError, setPreferenceError] = useState("");
    const [isSavingUsername, setIsSavingUsername] = useState(false);
    const [isSavingPreferences, setIsSavingPreferences] = useState(false);
    const [cropSource, setCropSource] = useState<string | null>(null);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

    useEffect(() => {
        if (!user) return;

        setUsername(user.username ?? "");
        setResetHour(String(user.preference?.resetHour ?? 0));
        setQuoteDelay(String(user.preference?.quoteDelay ?? 10));
        setWallpaperStyle(user.preference?.wallpaperStyle ?? "wallpaper-1");
        setFrameStyle(user.preference?.frameStyle ?? DEFAULT_FRAME_STYLE);
        setBookmarkStyle(user.preference?.bookmarkStyle ?? "bookmark-1");

        const selectedQuote = user.preference?.quoteCategory?.[0];
        setQuotePreference(selectedQuote ? selectedQuote : "Random");
    }, [user]);

    const profilePictureSrc = useMemo(
        () => getProfilePictureSrc(user?.profilePicture),
        [user?.profilePicture]
    );

    const handleProfilePicturePick = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setCropSource(reader.result);
            }
        };
        reader.readAsDataURL(file);
        event.target.value = "";
    };

    const handleSaveUsername = async () => {
        setAccountMessage("");
        setAccountError("");
        setIsSavingUsername(true);

        try {
            const trimmedUsername = username.trim();
            if (!trimmedUsername) {
                throw new Error("Username is required");
            }

            await updateUserProfile({ username: trimmedUsername });
            await refreshUser();
            setAccountMessage("Username updated successfully.");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed updating username.";
            setAccountError(message);
        } finally {
            setIsSavingUsername(false);
        }
    };

    const handleSavePreferences = async () => {
        setPreferenceMessage("");
        setPreferenceError("");
        setIsSavingPreferences(true);

        try {
            await updateUserPreferences({
                resetHour: Number(resetHour),
                quoteDelay: Number(quoteDelay) as QuoteDelayMinutes,
                wallpaperStyle,
                frameStyle,
                bookmarkStyle,
                quoteCategory: quotePreference === "Random" ? [] : [quotePreference as QuoteCategory],
            });
            await refreshUser();
            setPreferenceMessage("Preferences updated successfully.");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed saving preferences.";
            setPreferenceError(message);
        } finally {
            setIsSavingPreferences(false);
        }
    };

    const handleSaveProfilePicture = async (file: File) => {
        setAccountMessage("");
        setAccountError("");

        try {
            await uploadUserProfilePicture(file);
            await refreshUser();
            setCropSource(null);
            setAccountMessage("Profile picture updated successfully.");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed uploading profile picture.";
            setAccountError(message);
        }
    };

    return (
        <>
            <div style={modalOverlayStyle} onClick={onClose}>
                <div
                    className="modal-card-base task-management-modal paper-sheet-lines user-settings-modal"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="task-management-modal-header user-settings-modal-header">
                        <div className="task-management-modal-title-group">
                            <Icons.Settings />
                            <h3>User Settings</h3>
                        </div>

                        <button
                            type="button"
                            className="icon-btn-square task-management-modal-close-btn user-settings-close-btn"
                            onClick={onClose}
                            aria-label="Close user settings"
                        >
                            <Icons.Close />
                        </button>
                    </div>

                    <p className="task-management-modal-subtitle user-settings-modal-subtitle">
                        Manage your profile, security, and dashboard preferences from one place.
                    </p>

                    <div className="user-settings-modal-layout">
                        <section className="task-management-modal-panel user-settings-group">
                            <div className="user-settings-group-header">
                                <div className="task-management-modal-title-group user-settings-group-title">
                                    <Icons.User />
                                    <h4>Account</h4>
                                </div>
                            </div>

                            <div className="user-settings-avatar-row">
                                <div className="user-settings-avatar-shell">
                                    <img
                                        src={profilePictureSrc}
                                        alt="Current profile"
                                        className="user-settings-avatar"
                                    />
                                </div>

                                <div className="user-settings-avatar-actions">
                                    <button
                                        type="button"
                                        className="user-settings-secondary-btn"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Icons.Edit />
                                        <span>Change Picture</span>
                                    </button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/gif"
                                        className="user-settings-file-input"
                                        onChange={handleProfilePicturePick}
                                    />
                                </div>
                            </div>

                            <div className="user-settings-field-block">
                                <label htmlFor="settings-username">Username</label>
                                <div className="user-settings-inline-row">
                                    <input
                                        id="settings-username"
                                        className="user-settings-input"
                                        value={username}
                                        onChange={(event) => setUsername(event.target.value)}
                                        placeholder="Enter username"
                                    />
                                    <button
                                        type="button"
                                        className="user-settings-primary-btn"
                                        onClick={handleSaveUsername}
                                        disabled={isSavingUsername}
                                    >
                                        {isSavingUsername ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </div>

                            <div className="user-settings-field-block">
                                <label>Password</label>
                                <button
                                    type="button"
                                    className="user-settings-primary-btn user-settings-block-btn"
                                    onClick={() => {
                                        setAccountError("");
                                        setAccountMessage("");
                                        setShowChangePasswordModal(true);
                                    }}
                                >
                                    <Icons.Lock />
                                    <span>Change Password</span>
                                </button>
                            </div>

                            {accountError ? (
                                <p className="user-settings-feedback error">{accountError}</p>
                            ) : null}
                            {accountMessage ? (
                                <p className="user-settings-feedback success">{accountMessage}</p>
                            ) : null}
                        </section>

                        <section className="task-management-modal-panel user-settings-group">
                            <div className="user-settings-group-header">
                                <div className="task-management-modal-title-group user-settings-group-title">
                                    <Icons.Settings />
                                    <h4>Preferences</h4>
                                </div>
                            </div>

                            <div className="user-settings-preference-grid">
                                <DropdownMenu
                                    label="Reset Hour"
                                    value={`${resetHour}:00`}
                                    selectedValue={resetHour}
                                    options={RESET_HOUR_OPTIONS}
                                    onChange={setResetHour}
                                    maxHeight={180}
                                />

                                <DropdownMenu
                                    label="Bookmark Style"
                                    value={BOOKMARK_OPTIONS.find((option) => option.value === bookmarkStyle)?.label ?? "Navy Flower"}
                                    selectedValue={bookmarkStyle}
                                    options={BOOKMARK_OPTIONS}
                                    onChange={setBookmarkStyle}
                                    maxHeight={220}
                                />

                                <DropdownMenu
                                    label="Quote Preference"
                                    value={QUOTE_OPTIONS.find((option) => option.value === quotePreference)?.label ?? "Random"}
                                    selectedValue={quotePreference}
                                    options={QUOTE_OPTIONS}
                                    onChange={setQuotePreference}
                                    maxHeight={220}
                                />

                                <DropdownMenu
                                    label="Quote Delay"
                                    value={QUOTE_DELAY_DROPDOWN_OPTIONS.find((option) => option.value === quoteDelay)?.label ?? "10 Minutes"}
                                    selectedValue={quoteDelay}
                                    options={QUOTE_DELAY_DROPDOWN_OPTIONS}
                                    onChange={setQuoteDelay}
                                    maxHeight={180}
                                />

                                <DropdownMenu
                                    label="Wallpaper Style"
                                    value={WALLPAPER_OPTIONS.find((option) => option.value === wallpaperStyle)?.label ?? "Warm Cream Paper"}
                                    selectedValue={wallpaperStyle}
                                    options={WALLPAPER_OPTIONS}
                                    onChange={setWallpaperStyle}
                                    maxHeight={180}
                                />

                                <DropdownMenu
                                    label="Frame Style"
                                    value={FRAME_OPTIONS.find((option) => option.value === frameStyle)?.label ?? FRAME_STYLE_LABELS[DEFAULT_FRAME_STYLE]}
                                    selectedValue={frameStyle}
                                    options={FRAME_OPTIONS}
                                    onChange={setFrameStyle}
                                    maxHeight={180}
                                />
                            </div>

                            <div className="user-settings-theme-row">
                                <div className="user-settings-theme-copy">
                                    <span className="user-settings-theme-label">Theme</span>
                                    <span className="user-settings-theme-value">
                                        {theme === "light" ? "Light Mode" : "Dark Mode"}
                                    </span>
                                </div>
                                <ThemeToggle theme={theme} onToggle={toggleTheme} />
                            </div>

                            <button
                                type="button"
                                className="user-settings-primary-btn user-settings-block-btn"
                                onClick={handleSavePreferences}
                                disabled={isSavingPreferences}
                            >
                                <Icons.Confirm />
                                <span>{isSavingPreferences ? "Saving..." : "Save Preferences"}</span>
                            </button>

                            {preferenceError ? (
                                <p className="user-settings-feedback error">{preferenceError}</p>
                            ) : null}
                            {preferenceMessage ? (
                                <p className="user-settings-feedback success">{preferenceMessage}</p>
                            ) : null}
                        </section>
                    </div>
                </div>
            </div>

            {cropSource ? (
                <ProfilePictureCropModal
                    imageSrc={cropSource}
                    onClose={() => setCropSource(null)}
                    onSave={handleSaveProfilePicture}
                />
            ) : null}

            {showChangePasswordModal ? (
                <ChangePasswordModal
                    onClose={() => setShowChangePasswordModal(false)}
                    onSuccess={(message) => {
                        setAccountError("");
                        setAccountMessage(message);
                    }}
                />
            ) : null}
        </>
    );
};

export default UserSettingsModal;
