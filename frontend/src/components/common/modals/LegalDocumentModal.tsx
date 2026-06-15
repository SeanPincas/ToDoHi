import React from "react";
import { useTodo } from "../../../context/TodoContext";
import { modalOverlayStyle } from "../../../styles/modalStyles";
import { Icons } from "../../../styles/iconLibrary";
import "./modalBaseTheme.css";
import "./taskManagementModalTheme.css";
import "./LegalDocumentModal.css";

const PRIVACY_POLICY_SECTIONS = [
    {
        title: "Privacy Policy for ToDoHi",
        body: [
            "Effective Date: June 30, 2026",
            "ToDoHi is a productivity and daily planning application designed to help users organize tasks, create daily plans, write memos, track progress, and view productivity statistics through charts and summaries.",
            "This Privacy Policy explains how ToDoHi collects, uses, stores, and protects user information.",
        ],
    },
    {
        title: "1. Information We Collect",
        body: [
            "When you use ToDoHi, we may collect and store the following types of information:",
            "Account Information: Name or display name, email address, password authentication data, user preferences and settings.",
            "Productivity Data: To-do list items, task status, priority, due dates, and completion data, daily planner entries, memo or note content, productivity statistics and chart-related data, reset-hour preferences, quote or dashboard preferences.",
            "Technical Information: Login activity, basic device or browser-related information, error logs or system-related information needed to maintain the app.",
        ],
    },
    {
        title: "2. How We Use Your Information",
        body: [
            "ToDoHi uses your information to create and manage your account, save and display your tasks, daily plans, and memos, generate productivity statistics, charts, summaries, and progress indicators, personalize your dashboard experience, improve app performance, reliability, and usability, maintain account security and prevent unauthorized access, and fix bugs, technical issues, and service errors.",
        ],
    },
    {
        title: "3. User-Created Content",
        body: [
            "ToDoHi stores content that you create inside the app, including tasks, daily plans, memo entries, and related productivity records.",
            "You are responsible for the content you add to ToDoHi. Please avoid storing highly sensitive personal information, confidential documents, passwords, financial credentials, medical records, or other private information that is not necessary for daily planning.",
        ],
    },
    {
        title: "4. Data Storage and Security",
        body: [
            "ToDoHi uses reasonable technical and organizational measures to protect user data from unauthorized access, misuse, loss, or disclosure.",
            "These measures may include password authentication, protected user accounts, secure backend routes, database access controls, environment-based configuration, and limited access to user data.",
            "However, no online service can guarantee complete security. Users should also protect their own login credentials and avoid sharing account access.",
        ],
    },
    {
        title: "5. Data Sharing",
        body: [
            "ToDoHi does not sell user personal information.",
            "We do not share your personal data with third parties except when necessary to operate and maintain the application, store data using hosting or database service providers, comply with legal obligations, or protect the rights, safety, and security of ToDoHi, its users, or others.",
        ],
    },
    {
        title: "6. Third-Party Services",
        body: [
            "ToDoHi may use third-party services for hosting, database storage, deployment, authentication support, analytics, or application infrastructure.",
            "These services may process limited technical or account-related information only as needed to operate the app.",
        ],
    },
    {
        title: "7. Data Retention",
        body: [
            "ToDoHi keeps your account information and productivity data for as long as your account remains active or as needed to provide the service.",
            "If you delete your account or request deletion, ToDoHi will delete or anonymize your account data where reasonably possible, unless retention is required for legal, security, or technical reasons.",
        ],
    },
    {
        title: "8. Data Deletion",
        body: [
            "Users may request deletion of their account and related data.",
            "Deleted data may include account information, tasks, daily plans, memos, productivity records, and user preferences.",
            "Some backup copies or system logs may remain temporarily before being permanently removed according to technical limitations and maintenance procedures.",
        ],
    },
    {
        title: "9. User Rights",
        body: [
            "Depending on applicable privacy laws, users may have the right to access their personal data, correct inaccurate information, request deletion of their data, withdraw consent where applicable, object to certain processing activities, or request information about how their data is used.",
            "To exercise these rights, users may contact ToDoHi through the contact information provided below.",
        ],
    },
    {
        title: "10. Children’s Privacy",
        body: [
            "ToDoHi is not intended for children under the age required by applicable law. We do not knowingly collect personal information from children without appropriate consent.",
            "If we become aware that a child has provided personal information without proper consent, we will take steps to delete that information.",
        ],
    },
    {
        title: "11. Changes to This Privacy Policy",
        body: [
            "ToDoHi may update this Privacy Policy from time to time. When changes are made, the effective date will be updated.",
            "Users are encouraged to review this Privacy Policy periodically to stay informed about how their information is handled.",
        ],
    },
    {
        title: "12. Contact Information",
        body: [
            "For questions, concerns, or data deletion requests, you may contact:",
            "ToDoHi Support",
            "Email: seanpdev28@gmail.com",
        ],
    },
];

const TERMS_SECTIONS = [
    {
        title: "Terms and Conditions for ToDoHi",
        body: [
            "Effective Date: June 30, 2026",
            "Welcome to ToDoHi. These Terms and Conditions explain the rules and responsibilities that apply when using the ToDoHi application.",
            "By accessing or using ToDoHi, you agree to these Terms and Conditions. If you do not agree, please do not use the app.",
        ],
    },
    {
        title: "1. About ToDoHi",
        body: [
            "ToDoHi is a productivity and daily planning application that helps users manage tasks, create daily plans, write memos, view progress statistics, and organize personal productivity workflows.",
            "The app is designed as a personal daily execution companion and is not intended to replace professional, medical, financial, legal, or mental health advice.",
        ],
    },
    {
        title: "2. User Accounts",
        body: [
            "To use certain features of ToDoHi, you may need to create an account.",
            "You agree to provide accurate account information, keep your login credentials secure, avoid sharing your account with others, and notify us if you believe your account has been accessed without permission.",
            "You are responsible for activities that occur under your account.",
        ],
    },
    {
        title: "3. Acceptable Use",
        body: [
            "You agree to use ToDoHi responsibly and legally.",
            "You must not use the app for illegal, harmful, abusive, or fraudulent purposes, attempt to access another user’s account or data, upload or store harmful code, malware, or malicious content, interfere with the security, availability, or performance of the app, reverse engineer, exploit, or attack the application, or use ToDoHi to store highly sensitive credentials or confidential information that is not necessary for productivity planning.",
        ],
    },
    {
        title: "4. User Content",
        body: [
            "You own the tasks, daily plans, memos, and other content you create in ToDoHi.",
            "By using the app, you allow ToDoHi to store, process, and display your content only as needed to provide the service.",
            "You are responsible for the accuracy, legality, and appropriateness of the content you add to the app.",
        ],
    },
    {
        title: "5. Productivity Statistics and Charts",
        body: [
            "ToDoHi may generate productivity statistics, dashboard summaries, charts, and progress indicators based on your tasks, plans, memos, and activity records.",
            "These statistics are provided for personal organization and self-monitoring only. They should not be treated as professional advice or guaranteed performance measurements.",
        ],
    },
    {
        title: "6. App Availability",
        body: [
            "We aim to keep ToDoHi available and reliable, but we do not guarantee uninterrupted access.",
            "The app may occasionally be unavailable due to maintenance, updates, technical issues, hosting or database service interruptions, security improvements, or unexpected errors.",
            "We are not responsible for losses caused by temporary service interruptions.",
        ],
    },
    {
        title: "7. Data Loss and Backups",
        body: [
            "ToDoHi takes reasonable steps to protect user data, but we cannot guarantee that data will never be lost, corrupted, delayed, or unavailable.",
            "Users are encouraged to keep separate copies of important notes, plans, or information that they cannot afford to lose.",
        ],
    },
    {
        title: "8. Account Suspension or Termination",
        body: [
            "We may suspend or terminate access to ToDoHi if a user violates these Terms, misuses the app, attempts to harm the system or other users, engages in unauthorized access or abuse, or creates legal, technical, or security risks.",
            "Users may also request account deletion according to the Privacy Policy.",
        ],
    },
    {
        title: "9. Third-Party Services",
        body: [
            "ToDoHi may rely on third-party tools or service providers for hosting, database storage, deployment, authentication, analytics, or other infrastructure needs.",
            "We are not responsible for interruptions, policy changes, or issues caused by third-party services outside our control.",
        ],
    },
    {
        title: "10. Limitation of Liability",
        body: [
            "ToDoHi is provided on an “as is” and “as available” basis.",
            "To the maximum extent allowed by law, ToDoHi and its developer are not liable for lost data, missed tasks or reminders, productivity losses, service interruptions, user mistakes, unauthorized access caused by user negligence, or indirect or consequential damages.",
        ],
    },
    {
        title: "11. No Professional Advice",
        body: [
            "ToDoHi may help users organize routines, tasks, goals, and productivity habits. However, the app does not provide professional advice.",
            "Any suggestions, reminders, progress summaries, or productivity insights are for general personal organization only.",
        ],
    },
    {
        title: "12. Changes to the Terms",
        body: [
            "ToDoHi may update these Terms and Conditions from time to time.",
            "Continued use of the app after changes are made means you accept the updated Terms.",
        ],
    },
    {
        title: "13. Contact Information",
        body: [
            "For questions or concerns about these Terms, you may contact:",
            "ToDoHi Support",
            "Email: seanpdev28@gmail.com",
        ],
    },
];

const LegalDocumentModal: React.FC = () => {
    const { modal, closeModal } = useTodo();

    const isPrivacyOpen = modal.isOpen && modal.type === "privacyPolicy";
    const isTermsOpen = modal.isOpen && modal.type === "termsConditions";

    if (!isPrivacyOpen && !isTermsOpen) return null;

    const isPrivacy = isPrivacyOpen;
    const title = isPrivacy ? "Privacy Policy" : "Terms and Conditions";
    const Icon = isPrivacy ? Icons.Lock : Icons.Notebook;
    const sections = isPrivacy ? PRIVACY_POLICY_SECTIONS : TERMS_SECTIONS;

    return (
        <div style={modalOverlayStyle} className="legal-document-overlay" onMouseDown={closeModal}>
            <div
                className="modal-card-base legal-document-card task-management-modal paper-sheet-lines"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="legal-document-header task-management-modal-header">
                    <div className="task-management-modal-title-group">
                        <Icon />
                        <h3>{title}</h3>
                    </div>
                    <button
                        type="button"
                        className="icon-btn-square task-management-modal-close-btn"
                        onClick={closeModal}
                        aria-label={`Close ${title}`}
                    >
                        <Icons.Close />
                    </button>
                </div>

                <div className="legal-document-scroll task-management-modal-panel">
                    <div className="legal-document-content">
                        {sections.map((section) => (
                            <section key={section.title} className="legal-document-section">
                                <h4>{section.title}</h4>
                                {section.body.map((paragraph) => (
                                    <p key={paragraph}>{paragraph}</p>
                                ))}
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalDocumentModal;
