export const fetchSeaConditionData = async (menuType: string) => {
    try {
        const response = await fetch('/api/sea-condition', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ menuType })
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (data.success) {
                return { success: true, data: data.data };
            } else {
                return { success: false, message: data.message };
            }
        } else {
            const text = await response.text();
            console.error('서버 응답이 JSON이 아닙니다. ', response.status, text);
            throw new Error(`서버 응답이 JSON이 아닙니다 (상태: ${response.status}): ${text}`);
        }
    } catch (error: any) {
        console.error('api서버 오류:', error);
        return { success: false, message: `api서버 오류: ${error.message}` };
    }
};

// 게시판 카테고리 불러오기
export const fetchCategories = async () => {
    try {
        const response = await fetch('/categories');
        if (!response.ok) {
            throw new Error(response.status + '');
        }
        const data = await response.json();
        return { success: true, data };
    } catch (error: any) {
        console.error('불러오기 오류', error);
        return { success: false, message: `카테고리 불러오기 오류: ${error.message}` };
    }
};

// 게시판 목록 불러오기
export const fetchBoardList = async () => {
    try {
        const response = await fetch('/get_board_list/v1');
        if (!response.ok) {
            throw new Error(response.status + '');
        }
        const data = await response.json();
        return { success: true, data };
    } catch (error: any) {
        console.error('게시판 목록 불러오기 오류', error);
        return { success: false, message: `게시판 목록 불러오기 오류: ${error.message}` };
    }
};

// DivePointMst 데이터 불러오기
export const fetchDivePointMst = async () => {
    try {
        const response = await fetch('/api/Get_DivePointMst_V1');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, data };
    } catch (error: any) {
        console.error('DivePointMst 데이터를 불러오는 중 오류가 발생했습니다.', error);
        return { success: false, message: error.message };
    }
};