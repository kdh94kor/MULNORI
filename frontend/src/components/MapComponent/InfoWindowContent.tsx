import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';

interface InfoWindowContentProps {
    point: {
        id: number;
        lat: number;
        lot: number;
        pointName: string;
        tags?: string | { id: number; name: string; tagtype: string; tagStatus: string; }[]; // Can be string or array
        pointStatus: "PENDING" | "APPROVED" | "REJECTED";
    };
    onTagDelete: (pointId: number, tagToDelete: string) => void;
    onTagAdd: (pointId: number, newTag: string) => void;
}

const InfoWindowContent: React.FC<InfoWindowContentProps> = ({ point, onTagDelete, onTagAdd }) => {
    const [newTag, setNewTag] = useState('');
    const [isAddingTag, setIsAddingTag] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleTagDelete = async (tag: string) => {
        const result = await Swal.fire({
            title: '다이빙 가보자고',
            text: `'${tag}' 태그를 삭제하시겠습니까?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        });
        if (result.isConfirmed && point.id) {
            onTagDelete(point.id, tag);
        }
    };

    // tags가 문자열일 수도 있고, 객체 배열일 수도 있음
    const tagsArray: string[] = (() => {
        if (!point.tags) return [];
        if (typeof point.tags === 'string') {
            return point.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag !== '');
        }
        if (Array.isArray(point.tags)) {
            return point.tags.map((tag: any) => tag.name || tag).filter((tag: string) => tag);
        }
        return [];
    })();

    const handleTagAdd = () => {
        if (newTag.trim() && !tagsArray.includes(newTag.trim()) && point.id) {
            onTagAdd(point.id, newTag.trim());
            setNewTag('');
        } else if (tagsArray.includes(newTag.trim())) {
            Swal.fire({ title: '다이빙 가보자고', text: '이미 존재하는 태그입니다.', icon: 'warning' });
        }
    };

    useEffect(() => {
        if (isAddingTag && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAddingTag]);

    return (
        <div style={{ padding: '15px', width: '260px', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#dc3545' }}>{point.pointName}</h4>
            <div style={{ fontSize: '13px', lineHeight: '1.6', display: 'flex', flexDirection: 'column' }}>
                {tagsArray.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px', marginBottom: '10px', width: '100%' }}>
                        {tagsArray.map((tag, index) => (
                            <span
                                key={index}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    backgroundColor: '#e0e0e0',
                                    color: '#333',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    marginRight: '5px',
                                    marginBottom: '5px',
                                    fontSize: '12px',
                                }}
                            >
                                {tag}
                                <span
                                    onClick={() => handleTagDelete(tag)}
                                    style={{
                                        marginLeft: '5px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '12px',
                                        color: '#888',
                                    }}
                                >
                                    &times;
                                </span>
                            </span>
                        ))}
                    </div>
                )}

                {/* Tag Addition UI - Moved here */}
                <div style={{ marginTop: '5px', marginBottom: '10px' }}> {/* Adjusted margin for placement */}
                    {!isAddingTag ? (
                        <span
                            onClick={() => setIsAddingTag(true)}
                            style={{
                                display: 'inline-block',
                                cursor: 'pointer',
                                color: '#adb5bd', // Light gray color
                                textDecoration: 'none', // Remove underline
                                fontSize: '12px',
                            }}
                        >
                            #태그추가
                        </span>
                    ) : (
                        <input
                            ref={inputRef}
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleTagAdd();
                                    setIsAddingTag(false);
                                }
                            }}
                            onBlur={() => {
                                if (!newTag.trim()) {
                                    setIsAddingTag(false);
                                }
                            }}
                            placeholder="새 태그 입력 후 Enter"
                            style={{
                                width: '100%',
                                padding: '5px',
                                border: 'none', // No border
                                background: 'transparent', // Transparent background
                                borderBottom: '1px solid #ced4da', // Subtle bottom border for input feel
                                borderRadius: '0', // No border radius
                                fontSize: '12px',
                                outline: 'none', // Remove outline on focus
                            }}
                        />
                    )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                    <span style={{ color: '#dc3545', fontSize: '1.2em', marginRight: '5px' }}>❤️</span>
                    {/* <span style={{ fontSize: '13px', color: '#6c757d' }}>{point.recommendationCount || 0}</span> */}
                    <em style={{ color: '#6c757d', marginLeft: '10px' }}>(000님 추천 포인트)</em>
                </div>
            </div>
        </div>
    );
};

export default InfoWindowContent;
