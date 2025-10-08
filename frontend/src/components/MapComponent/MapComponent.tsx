import React, { useEffect, useRef, useState } from 'react';
import styles from '../MainLayout/MainLayout.module.css';
import InfoPanel from '../InfoPanel/InfoPanel';
import { fetchDivePointMst } from '../../utils/api';

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

interface DivePointMst {
    id: number;
    lat: number;
    lot: number;
    pointName: string;
    tags: string;
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
    lot: number;
}

interface AddDivePoint {
    lat: number;
    lot: number;
    pointName: string;
    tags: string[];
}

const MapComponent: React.FC<MapComponentProps> = ({ kakaoMapKey, seaConditionData, infoPanelLoading, infoPanelError }) => {

    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [markers, setMarkers] = useState<any[]>([]);
    const [divePoints, setDivePoints] = useState<DivePoint[]>([]);
    const [divePointMsts, setDivePointMsts] = useState<DivePointMst[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [dataError, setMapNotice] = useState<string | null>(null);

    // --- 포인트 등록 관련 상태 ---
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, lat: 0, lot: 0 });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [pointName, setPointName] = useState('');
    const [pointCoords, setPointCoords] = useState<{ lat: number; lot: number } | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');

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
  
    const addMarkers = (points: DivePoint[], divePointMsts: DivePointMst[]) => {
        if (!map || !window.kakao || !window.kakao.maps) return;

        try {
            // 이전에 생성된 마커 제거
            markers.forEach(marker => marker.setMap(null));

            const newMarkers: any[] = [];

            // 1. DivePoint (공공데이터) 마커 생성
            try {
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

                Array.from(locationMap.values()).forEach(location => {
                    const markerPosition = new window.kakao.maps.LatLng(location.lat, location.lot);
                    const marker = new window.kakao.maps.Marker({
                        position: markerPosition,
                        title: location.skscExpcnRgnNm
                    });

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
                    newMarkers.push(marker);

                    window.kakao.maps.event.addListener(marker, 'click', function () {
                        if (window.currentInfoWindow) {
                            window.currentInfoWindow.close();
                        }
                        infowindow.open(map, marker);
                        window.currentInfoWindow = infowindow;
                    });

                    window.kakao.maps.event.addListener(marker, 'mouseover', function () { marker.setOpacity(0.7); });
                    window.kakao.maps.event.addListener(marker, 'mouseout', function () { marker.setOpacity(1.0); });
                });
            } catch (e) {
                console.error("DivePoint 마커 생성 중 오류 발생:", e);
            }

            // 2. DivePointMst (사용자 등록) 마커 생성
            try {
                divePointMsts.forEach(point => {
                    const markerPosition = new window.kakao.maps.LatLng(point.lat, point.lot);
                    // 사용자 등록 포인트는 우선 빨간색 마커로 표시해주자
                    const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';
                    const imageSize = new window.kakao.maps.Size(31, 35);
                    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

                    const marker = new window.kakao.maps.Marker({
                        position: markerPosition,
                        title: point.pointName,
                        image: markerImage
                    });

                    let infoContent = `<div style="padding:15px; min-width:250px;">
                                        <h4 style="margin:0 0 10px 0; color:#dc3545;">${point.pointName}</h4>
                                        <div style="font-size:13px; line-height:1.6;">
                                            ${point.tags ? `<strong>#태그:</strong> ${point.tags}<br>` : ''} 
                                            <em style="color:#6c757d;">(000님 추천 포인트)</em>
                                        </div>
                                   </div>`;

                    const infowindow = new window.kakao.maps.InfoWindow({
                        content: infoContent,
                        removable: true
                    });

                    marker.setMap(map);
                    newMarkers.push(marker);

                    window.kakao.maps.event.addListener(marker, 'click', function () {
                        if (window.currentInfoWindow) {
                            window.currentInfoWindow.close();
                        }
                        infowindow.open(map, marker);
                        window.currentInfoWindow = infowindow;
                    });

                    window.kakao.maps.event.addListener(marker, 'mouseover', function () { marker.setOpacity(0.7); });
                    window.kakao.maps.event.addListener(marker, 'mouseout', function () { marker.setOpacity(1.0); });
                });
            } catch (e) {
                console.error("DivePointMst 마커추가 오류:", e);
            }

            setMarkers(newMarkers);
        } catch (e) {
            console.error("addMarkers 오류:", e);
        }
    };

    const loadDivePointData = async (page: number) => {
        try {
            setMapNotice(null); 
            const response = await fetch(`/api/Get_DivePoint_V1?pageNo=${page}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log(`응답 : ${response}`);

            const data: DivePoint[] = await response.json();

            if (data && data.length > 0) { 
                if (page === 1) {
                    setDivePoints(data); 
                } else {
                    setDivePoints(prevPoints => [...prevPoints, ...data]);
                }
            } else {
                if (page > 1) {
                    alert('더 이상 불러올 데이터가 없습니다.');
                }
            }
        } catch (error: any) {
            console.error('다이빙 포인트를 불러오는데 에러가 발생했습니다..', error);
            setDivePoints([]); 
            setMapNotice('현재 공공 API 장애로 인해 다이빙 포인트 정보를 불러올 수 없습니다.');
        }
    };

    //포인트 등록 v1
    const addDivePointData = async (pointData: AddDivePoint) =>{
        
        try{
            const response = await fetch(`/api/Set_DivePointMst_V1`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pointData),
            });

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const error = await response.json();
                    errorMessage = error.message || '포인트 등록 실패ㅠ';
                } catch (e) {
                    // 응답이 JSON이 아닐 경우를 대비
                }
                throw new Error(errorMessage);
            }

            await response.json();

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

                        window.kakao.maps.event.addListener(kakaoMap, 'rightclick', (mouseEvent: any) => {
                            const latlng = mouseEvent.latLng;
                            setContextMenu({
                                visible: true,
                                x: mouseEvent.point.x,
                                y: mouseEvent.point.y,
                                lat: latlng.getLat(),
                                lot: latlng.getLng(),
                            });
                        });

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

    useEffect(() => {
        if (map) {
            loadDivePointData(1);
            const loadMstData = async () => {
                const result = await fetchDivePointMst();
                if (result.success) {
                    setDivePointMsts(result.data);
                } else {
                    setMapNotice(result.message || '사용자 등록 포인트를 불러오는 중 오류가 발생했습니다.');
                }
            };
            loadMstData();
        }
    }, [map]);

    useEffect(() => {
        if (currentPage > 1) {
            loadDivePointData(currentPage);
        }
    }, [currentPage]);

    //alert창으로 에러를 표시하다보니 페이지가 아예 깨져버리는 문제로 notice 추가 
    useEffect(() => {
        if(map && !dataError) {
            addMarkers(divePoints, divePointMsts);
        }
    }, [divePoints, divePointMsts, map, dataError]);

    const handleLoadMore = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    // --- 포인트 등록 관련 핸들러 ---
    const handleOpenForm = () => {
        // 폼 열 때 모든 관련 상태 초기화
        setPointCoords({ lat: contextMenu.lat, lot: contextMenu.lot });

        setIsFormOpen(true);
        setPointName('');
        setTags([]);
        setCurrentTag('');
        setContextMenu({ visible: false, x: 0, y: 0, lat: 0, lot: 0 }); // 메뉴 닫기

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
                lot: pointCoords.lot,
                pointName: pointName,
                tags: tags
            };
            console.log(`${newPointData.lat},${newPointData.lot},${newPointData.pointName},${newPointData.tags}`);
            await addDivePointData(newPointData);

            alert('🎉포인트 등록이 요청이 정상적으로 완료되었습니다!🎉\n\n🤲담당자 검토 후 반영됩니다!🤲');
            setIsFormOpen(false);

        }catch(error: any){
            alert(`포인트 등록 요청 실패ㅠ: ${error.message}`);
        }
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            const newTag = currentTag.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setCurrentTag(''); 
        }
    };

    const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
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
            {dataError && (
                <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', borderRadius: '5px', zIndex: 1000 }}>
                    {dataError}
                </div>
            )}
            <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
            <InfoPanel seaConditionData={seaConditionData} loading={infoPanelLoading} error={infoPanelError} />
            <button onClick={handleLoadMore} style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, padding: '10px 20px' }}>
                더 불러오기
            </button>

            {contextMenu.visible && (
                <div style={{ ...contextMenuStyle, top: contextMenu.y, left: contextMenu.x }}>
                    <div style={contextMenuItemStyle} onClick={handleOpenForm}>
                        포인트 등록요청
                    </div>
                </div>
            )}

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
                                <input type="text" readOnly value={pointCoords.lot.toFixed(6)} style={readOnlyInputStyle} />
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

const contextMenuStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    zIndex: 100, // z축 우선순위
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
    zIndex: 110, // 컨텍스트보다 더 위에 떠야함
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
