import React, { useEffect, useRef, useState } from 'react';
import styles from '../MainLayout/MainLayout.module.css';
import InfoPanel from '../InfoPanel/InfoPanel';

//DivePoint entity와는 구조를 다르게 가자
interface DivePoint {
    id: number;
    lat: number;
    lot: number;
    skscExpcnRgnNm: string;
    predcYmd: string;
    predcNoonSeCd: string;
    minWvhgt: number;
    maxWvhgt: number;
    minWtem: number;
    maxWtem: number;
    totalIndex: string;
    lastScr: number;
}

declare global {
    interface Window {
        kakao: any;
        currentInfoWindow: any;
    }
}

interface MapComponentProps {
    kakaoMapKey: string;
    seaConditionData: any;
    infoPanelLoading: boolean;
    infoPanelError: string | null;
}

// 우클릭 메뉴 상태 타입
interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    lat: number;
    lng: number;
}

interface AddDivePoint {
    lat: number;
    lng: number;
    pointName: string;
    tags: string[];
}

const MapComponent: React.FC<MapComponentProps> = ({ kakaoMapKey, seaConditionData, infoPanelLoading, infoPanelError }) => {

    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [markers, setMarkers] = useState<any[]>([]);
    const [divePoints, setDivePoints] = useState<DivePoint[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    // --- 포인트 등록 관련 상태 ---
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, lat: 0, lng: 0 });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [pointName, setPointName] = useState('');
    const [pointCoords, setPointCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');


    //스쿠버api 예제
    const getStatusColor = (status: string) => {
        switch (status) {
            case '매우좋음': return '#28a745';
            case '좋음': return '#17a2b8';
            case '보통': return '#ffc107';
            case '나쁨': return '#fd7e14';
            case '매우나쁨': return '#dc3545';
            default: return '#6c757d';
        }
    };
  
    const addMarkers = (points: DivePoint[]) => {
        if (!map) return;

        // 이전에 생성된 마커 제거
        markers.forEach(marker => marker.setMap(null));

        //절대값인 위도, 경도값으로 그룹핑하기. 포인트명으로 하면 중복될 수가 있음...
        const locationMap = new Map<string, { lat: number; lot: number; skscExpcnRgnNm: string; data: DivePoint[] }>();

        points.forEach(point => {
            const key = `${point.lat}_${point.lot}`;
            if (!locationMap.has(key)) {
                locationMap.set(key, {
                    lat: point.lat,
                    lot: point.lot,
                    skscExpcnRgnNm: point.skscExpcnRgnNm,
                    data: []
                });
            }
            locationMap.get(key)!.data.push(point);
        });

        const newMarkers = Array.from(locationMap.values()).map(location => {
            const markerPosition = new window.kakao.maps.LatLng(location.lat, location.lot);
            
            const marker = new window.kakao.maps.Marker({
                position: markerPosition,
                title: location.skscExpcnRgnNm
            });

            //날짜, 오전, 오후로 정렬하기. 백엔드에서 정렬해주지만 혹시 모른다.
            location.data.sort((a, b) => {
                const dateA_str = a.predcYmd.split(' ')[0];
                const dateB_str = b.predcYmd.split(' ')[0];
                const dateA = new Date(`${dateA_str} ${a.predcNoonSeCd === '오전' ? '06:00' : '18:00'}`);
                const dateB = new Date(`${dateB_str} ${b.predcNoonSeCd === '오전' ? '06:00' : '18:00'}`);
                return dateA.getTime() - dateB.getTime();
            });

            let infoContent = `<div style="padding:15px; min-width:280px; max-height:400px; overflow-y:auto;">
                                <h4 style="margin:0 0 10px 0; color:#007bff;">${location.skscExpcnRgnNm}</h4>`;

            location.data.forEach(item => {
                const statusColor = getStatusColor(item.totalIndex);
                infoContent += `
                    <div style="margin-bottom:10px; padding:8px; border-left:4px solid ${statusColor}; background-color:#f8f9fa;">
                        <div style="font-weight:bold; margin-bottom:5px;">
                            ${item.predcYmd} ${item.predcNoonSeCd}
                        </div>
                        <div style="font-size:13px; line-height:1.4;">
                            🌊 파고: ${item.minWvhgt}m ~ ${item.maxWvhgt}m<br>
                            🌡️ 수온: ${item.minWtem}℃ ~ ${item.maxWtem}℃<br>
                            📊 상태: <span style="color:${statusColor}; font-weight:bold;">${item.totalIndex}</span>
                            ${item.lastScr ? `<br>⭐ 점수: ${item.lastScr}점` : ''}
                        </div>
                    </div>`;
            });
            infoContent += `</div>`;

            const infowindow = new window.kakao.maps.InfoWindow({
                content: infoContent,
                removable: true
            });

            marker.setMap(map);

            window.kakao.maps.event.addListener(marker, 'click', function () {
                if (window.currentInfoWindow) {
                    window.currentInfoWindow.close();
                }
                infowindow.open(map, marker);
                window.currentInfoWindow = infowindow;
            });

            /*마커에 포인터가 올라오면 투명도 변경시켜주기*/
            window.kakao.maps.event.addListener(marker, 'mouseover', function () {
                marker.setOpacity(0.7);
            });

            window.kakao.maps.event.addListener(marker, 'mouseout', function () {
                marker.setOpacity(1.0);
            });

            return marker;
        });

        setMarkers(newMarkers);
    };

    const loadDivePointData = async (page: number) => {
        try {
            const response = await fetch(`/api/Get_DivePoint_V1?pageNo=${page}`);

            const data: DivePoint[] = await response.json();

            if (data && data.length > 0) { 
                if (page === 1) {
                    // 페이지 로드시 포인트 중 첫 페이지만 호출
                    setDivePoints(data); 
                } else {
                    // 첫 페이지가 아닐때 나머지 페이지 불러오기(더 불러오기 버튼)
                    setDivePoints(prevPoints => [...prevPoints, ...data]);
                }
            } else {
                alert('더 이상 불러올 데이터가 없습니다.');
            }
        } catch (error: any) {
            console.error('다이빙 포인트를 불러오는데 에러가 발생했습니다..', error);
        }
    };

    //포인트 등록 v1
    const addDivePointData = async (pointData: AddDivePoint) =>{
        
        try{
            const response = await fetch(`/api/Set_DivePoint_V1`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pointData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '포인트 등록 실패ㅠ');
            }

            const result = await response.json();
            return true;

        } catch (error) {
            console.error('등록 api 상태오류 : ', error);
            throw error;
        }
    };

    useEffect(() => {
        if (!kakaoMapKey) return;
        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&libraries=services&autoload=false`;
        script.async = true;

        document.head.appendChild(script);

        script.onload = () => {
            window.kakao.maps.load(() => {
                setTimeout(() => {
                    if (mapRef.current) {
                        const kakaoMap = new window.kakao.maps.Map(mapRef.current, {
                            center: new window.kakao.maps.LatLng(37.5665, 126.9780),
                            level: 8
                        });
                        setMap(kakaoMap);

                        // 지도 우클릭 이벤트: 커스텀 메뉴 표시
                        window.kakao.maps.event.addListener(kakaoMap, 'rightclick', (mouseEvent: any) => {
                            const latlng = mouseEvent.latLng;
                            setContextMenu({
                                visible: true,
                                x: mouseEvent.point.x,
                                y: mouseEvent.point.y,
                                lat: latlng.getLat(),
                                lng: latlng.getLng(),
                            });
                        });

                        // 지도 클릭 이벤트: 커스텀 메뉴 숨기기
                        window.kakao.maps.event.addListener(kakaoMap, 'click', () => {
                            setContextMenu(prev => ({ ...prev, visible: false }));
                        });
                    }
                }, 0);
            });
        };

        return () => { 
            const existingScript = document.querySelector(`script[src*="${kakaoMapKey}"]`);
            if (existingScript) {
                document.head.removeChild(existingScript);
            }
        };
    }, [kakaoMapKey]);

    //최초 실행시 첫번째 목록만 불러오자
    useEffect(() => {
        if (map) {
            loadDivePointData(1);
        }
    }, [map]);

    // 더 불러오기
    useEffect(() => {
        if (currentPage > 1) {
            loadDivePointData(currentPage);
        }
    }, [currentPage]);

    //지도위에 마커 추가하기
    useEffect(() => {
        if(map) { 
            addMarkers(divePoints);
        }
    }, [divePoints, map]);

    const handleLoadMore = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    // --- 포인트 등록 관련 핸들러 ---
    const handleOpenForm = () => {
        // 폼 열 때 모든 관련 상태 초기화
        setPointCoords({ lat: contextMenu.lat, lng: contextMenu.lng });
        setIsFormOpen(true);
        setPointName('');
        setTags([]);
        setCurrentTag('');
        setContextMenu({ visible: false, x: 0, y: 0, lat: 0, lng: 0 }); // 메뉴 닫기
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pointName.trim()) {
            alert('포인트 이름을 입력해주세요.');
            return;
        }

        if (!pointCoords){
            alert('포인트에 대한 위치정보(위도, 경도)값이 없습니다. 다시 등록해주세요.');
            return;
        }

        try{
            const newPointData: AddDivePoint = {
                lat: pointCoords.lat,
                lng: pointCoords.lng,
                pointName: pointName,
                tags: tags
            };
            
            await addDivePointData(newPointData);

            alert('🎉포인트 등록이 요청이 정상적으로 완료되었습니다!🎉\n\n🤲담당자 검토 후 반영됩니다!🤲');
            setIsFormOpen(false);

        }catch(error: any){
            alert(`포인트 등록 요청 실패ㅠ: ${error.message}`);
        }
    };

    const handleFormCancel = () => {
        setIsFormOpen(false); // 취소 시 폼 닫기
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // 엔터키로 등록이라 폼 제출 방지를 위해 추가
            
            const newTag = currentTag.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setCurrentTag(''); 
        }
    };

    const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // 엔터키 등록방지
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };


    if (!kakaoMapKey || kakaoMapKey.includes('여기에')) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
               <h2>맵 api키가 없음</h2>
            </div>
        );
    }

    return (
        <div className={styles.mapContainer} onContextMenu={(e) => e.preventDefault()}>
            <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
            <InfoPanel seaConditionData={seaConditionData} loading={infoPanelLoading} error={infoPanelError} />
            <button onClick={handleLoadMore} style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, padding: '10px 20px' }}>
                더 불러오기
            </button>

            {/* 지도 우클릭 메뉴등록 */}
            {contextMenu.visible && (
                <div style={{ ...contextMenuStyle, top: contextMenu.y, left: contextMenu.x }}>
                    <div style={contextMenuItemStyle} onClick={handleOpenForm}>
                        포인트 등록요청
                    </div>
                </div>
            )}

            {/* 포인트 등록 폼 */}
            {isFormOpen && pointCoords && (
                <div style={formOverlayStyle}>
                    <div style={{...formContainerStyle, maxHeight: '80vh', overflowY: 'auto'}}>
                        <h3>새 다이빙 포인트 등록</h3>
                        <form onSubmit={handleFormSubmit}>
                            <div style={inputGroupStyle}>
                                <label>위도</label>
                                <input type="text" readOnly value={pointCoords.lat.toFixed(6)} style={readOnlyInputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label>경도</label>
                                <input type="text" readOnly value={pointCoords.lng.toFixed(6)} style={readOnlyInputStyle} />
                            </div>
                            <div style={inputGroupStyle}>
                                <label htmlFor="pointName">포인트 이름</label>
                                <input
                                    id="pointName"
                                    type="text"
                                    value={pointName}
                                    onChange={(e) => setPointName(e.target.value)}
                                    onKeyDown={handleTextKeyDown}
                                    placeholder="예: 양양시 하조대전망대"
                                    style={textInputStyle}
                                    autoFocus
                                />
                            </div>

                            {/* 포인트에 대한 태그 관리 */}
                            <div style={inputGroupStyle}>
                                <label htmlFor="tags">태그</label>
                                <input
                                    id="tags"
                                    type="text"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder="입력 후 Enter"
                                    style={textInputStyle}
                                />
                                <div style={tagsContainerStyle}>
                                    {tags.map((tag, index) => (
                                        <div key={index} style={tagStyle}>
                                            #{tag}
                                            <span style={tagRemoveStyle} onClick={() => handleRemoveTag(tag)}>
                                                &times;
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={buttonGroupStyle}>
                                <button type="submit" style={submitButtonStyle}>등록 요청</button>
                                <button type="button" onClick={handleFormCancel} style={cancelButtonStyle}>취소</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// 스타일 정의
const contextMenuStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    zIndex: 100, // 지도보다 위에 표시
    padding: '5px 0',
};

const contextMenuItemStyle: React.CSSProperties = {
    padding: '8px 15px',
    cursor: 'pointer',
    fontSize: '14px',
};

const formOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 110, // 컨텍스트 메뉴보다 위에 표시
};

const formContainerStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '20px 40px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    width: '400px',
};

const inputGroupStyle: React.CSSProperties = {
    marginBottom: '15px',
};

const readOnlyInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#f2f2f2',
    boxSizing: 'border-box',
};

const textInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
};

const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '20px',
};

const submitButtonStyle: React.CSSProperties = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    marginRight: '10px',
};

const cancelButtonStyle: React.CSSProperties = {
    padding: '10px 20px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: 'white',
    color: 'black',
    cursor: 'pointer',
};

// 태그 관련 스타일
const tagsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '10px',
};

const tagStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    color: '#495057',
    borderRadius: '12px',
    padding: '5px 10px',
    fontSize: '13px',
};

const tagRemoveStyle: React.CSSProperties = {
    marginLeft: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
};

export default MapComponent;
