import React from "react";
import { useNavigate } from "react-router-dom";

import { useMemoContext } from "../../context/MemoContext";
import { getMemoCategoryIconKey } from "../../utils/memoUtils/memoUtils";
import { Icons } from "../../styles/iconLibrary";

import "./MemoPreview.css";

const MemoPreview: React.FC = () => {
    const { memos, loading } = useMemoContext();
    const navigate = useNavigate();

    return (
        <div className="memo-preview-card">
            <div className="memo-preview-header">
                <div className="memo-preview-title">Memos</div>

                <button
                    className="memo-preview-link"
                    onClick={() => navigate("/memoboard")}
                >
                    View Board ?
                </button>
            </div>

            <div className="memo-preview-list-container">
                <div className="memo-preview-list-wrapper">
                    {loading && (
                        <div className="memo-preview-empty">
                            Loading memos...
                        </div>
                    )}

                    {!loading && memos.length === 0 && (
                        <div className="memo-preview-empty">
                            No memos yet.
                        </div>
                    )}

                    {!loading && memos.length > 0 && (
                        <div className="memo-preview-list">
                            {memos.map((memo) => {
                                const CategoryIcon = Icons[getMemoCategoryIconKey(memo.category)];
                                return (
                                    <div
                                        key={memo._id}
                                        className="memo-preview-item"
                                        style={{ backgroundColor: memo.containerColor }}
                                        onClick={() =>
                                            navigate("/memoboard", {
                                                state: {
                                                    openMemoId: memo._id,
                                                },
                                            })
                                        }
                                    >
                                        <span
                                            className="memo-preview-pin"
                                            style={{ backgroundColor: memo.pinColor }}
                                        />

                                        <div className="memo-preview-text">
                                            <div className="memo-preview-item-title">
                                                {memo.title}
                                            </div>

                                            <div className="memo-preview-category">
                                                <CategoryIcon /> {memo.category}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemoPreview;
