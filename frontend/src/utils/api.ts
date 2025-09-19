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