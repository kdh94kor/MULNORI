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

const MapComponent: React.FC<MapComponentProps> = ({ kakaoMapKey, seaConditionData, infoPanelLoading, infoPanelError }) => {

    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [markers, setMarkers] = useState<any[]>([]);
    const [divePoints, setDivePoints] = useState<DivePoint[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

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

    //이게 그 버튼 눌렀을때 동작을 정의하는거야
    const handleLoadMore = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    if (!kakaoMapKey || kakaoMapKey.includes('여기에')) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
               <h2>맵 api키가 없음</h2>
            </div>
        );
    }

    return (
        <div className={styles.mapContainer}>
            <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
            <InfoPanel seaConditionData={seaConditionData} loading={infoPanelLoading} error={infoPanelError} />
            <button onClick={handleLoadMore} style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, padding: '10px 20px' }}>
                더 불러오기
            </button>
        </div>
    );
};

export default MapComponent;
