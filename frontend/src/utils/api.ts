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

// 특정 상위 카테고리의 하위 카테고리 불러오기
export const fetchCategoriesByParent = async (parentName: string) => {
    try {
        const response = await fetch(`/api/categories/children/${encodeURIComponent(parentName)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, data };
    } catch (error: any) {
        console.error('하위 카테고리 불러오기 오류', error);
        return { success: false, message: `하위 카테고리 불러오기 오류: ${error.message}` };
    }
};

// 게시판 목록 불러오기
export const fetchBoardList = async () => {
    try {
        const response = await fetch('/api/get_board_list_V1');
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

// 새 게시글 등록
export const createPost = async (postData: { title: string; content: string; categoryId: number; author: string; }) => {
    try {
        const response = await fetch('/api/post_board_V1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'JSON 파싱 오류' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error: any) {
        console.error('게시글 등록 오류', error);
        return { success: false, message: error.message };
    }
};

// 게시글 읽어오기
export const getContent = async(id: string) => {
    
    try {

        const response = await fetch(`/api/get_board_content_v1/${id}`);

        if (!response.ok){
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message);
        }
        
        const data = await response.json();
        return {success: true, data};

    } catch (error: any) {
        console.log('게시글 조회 실패 ',error);
        return { success: false, message: error.message};
    }


} ;

// 이미지 업로드
export const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '이미지 업로드에 실패했습니다.');
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('이미지 업로드 오류:', error);
        return { success: false, message: error.message };
    }
};