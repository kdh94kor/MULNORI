import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { DivePointMst } from '../entity/DivePointMst';

const router = Router();

/**
 * @swagger
 * /Get_DivePoint_V1:
 *   get:
 *     summary: 다이빙 포인트 정보 조회
 *     description: 공공데이터 포털의 스킨스쿠버 지수 API를 이용해 다이빙 포인트 정보를 가져옵니다.
 *     tags: [DivePoint]
 *     parameters:
 *       - in: query
 *         name: pageNo
 *         schema:
 *           type: string
 *           default: '1'
 *         description: 페이지 번호
 *       - in: query
 *         name: numOfRows
 *         schema:
 *           type: string
 *           default: '10'
 *         description: 한 페이지 결과 수
 *     responses:
 *       '200':
 *         description: 성공. 다이빙 포인트 정보 배열을 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DivePoint'
 *       '500':
 *         description: 서버 오류 또는 API 키가 없는 경우.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 500 error
 */

router.get('/Get_DivePoint_V1', async (req: Request, res: Response) => {
    const { pageNo = '1', numOfRows = '10' } = req.query;
    const apiKey = process.env.OPENAPI_DIVE_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: '500 error' });
    }


    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const reqDate = `${year}${month}${day}${hours}`;

    const apiUrl = "https://apis.data.go.kr/1192136/fcstSkinScuba/GetFcstSkinScubaApiService";

    //스쿠버 파라미터
    const params = new URLSearchParams({
        serviceKey: apiKey,
        type: 'json',
        reqDate: reqDate,
        numOfRows: numOfRows as string,
        pageNo: pageNo as string
    });

    try {

        const response = await axios.get(`${apiUrl}?${params.toString()}`);
        const result = response.data; 

        //실제 데이터 영역
        const dataSection = result?.response?.body?.items?.item;

        let itemArrays: DivePoint[] = [];

        if (dataSection){ 
            const itemsArray = Array.isArray(dataSection) ? dataSection : [dataSection];

          itemArrays = itemsArray.map((item, index) => ({
                      id: index,
                      skscExpcnRgnNm: item.skscExpcnRgnNm,
                      lat: parseFloat(item.lat),
                      lot: parseFloat(item.lot),
                      predcYmd: `${item.predcYmd} (${new Date(item.predcYmd).toLocaleDateString('ko-KR', { weekday: 'short' })})`,
                      predcNoonSeCd: item.predcNoonSeCd === '일' ? '' : item.predcNoonSeCd, //먼 미래는 오전 오후 '일' 로만 들어와서 예외처리 
                      tdlvHrCn: '',
                      minWvhgt: item.minWvhgt,
                      maxWvhgt: item.maxWvhgt,
                      minWtem: item.minWtem,
                      maxWtem: item.maxWtem,
                      totalIndex: item.totalIndex,
                      lastScr: parseFloat(item.lastScr)
                     }));
          itemArrays.sort((a, b) => {
            const dateCompare = a.predcYmd.localeCompare(b.predcYmd);
            if (dateCompare !== 0) {
              return dateCompare;
            }
            return a.predcNoonSeCd.localeCompare(b.predcNoonSeCd);
          });
        }

        res.json(itemArrays);

    } catch (error: any) {
        if (error.response) {
            console.error('ERR data', error.response.data);
            console.error('ERR status', error.response.status);
        }
        res.status(500).json({ error: '데이터 조회 실패ㅠ' });
    }
});

export default router;
