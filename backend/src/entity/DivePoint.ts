import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

/**
 * @swagger
 * components:
 *   schemas:
 *     DivePoint:
 *       type: object
 *       required:
 *         - id
 *         - skscExpcnRgnNm
 *         - lat
 *         - lot
 *       properties:
 *         id:
 *           type: integer
 *           description: 자동 생성된 고유 ID
 *         skscExpcnRgnNm:
 *           type: string
 *           description: 다이빙 포인트 지역명
 *         lat:
 *           type: number
 *           format: double
 *           description: 위도
 *         lot:
 *           type: number
 *           format: double
 *           description: 경도
 *         predcYmd:
 *           type: string
 *           description: 예측일자 (YYYYMMDD)
 *         predcNoonSeCd:
 *           type: string
 *           description: 예측 시간 구분 (오전/오후)
 *         tdlvHrCn:
 *           type: string
 *           description: 조석 시간 정보
 *         minWvhgt:
 *           type: string
 *           description: 최소 파고(m)
 *         maxWvhgt:
 *           type: string
 *           description: 최대 파고(m)
 *         totalIndex:
 *           type: string
 *           description: 스쿠버 종합지수 (매우좋음, 좋음, 보통, 나쁨)
 *         lastScr:
 *           type: number
 *           format: double
 *           description: 최종 점수
 *       example:
 *         id: 1
 *         skscExpcnRgnNm: "제주 서귀포"
 *         lat: 33.2461
 *         lot: 126.5615
 *         predcYmd: "20250917"
 *         predcNoonSeCd: "오전"
 *         tdlvHrCn: "1"
 *         minWvhgt: "0.5"
 *         maxWvhgt: "1.0"
 *         totalIndex: "좋음"
 *         lastScr: 85
 */
@Entity()
export class DivePoint {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  skscExpcnRgnNm!: string; // 지역명

  @Column("double precision") // Double 타입
  lat!: number; // 위도

  @Column("double precision")
  lot!: number; // 경도

  @Column()
  predcYmd!: string; // 예측일

  @Column()
  predcNoonSeCd!: string; // 오전/오후

  @Column()
  tdlvHrCn!: string; // 조석정보

  @Column()
  minWvhgt!: string; // 최소파고

  @Column()
  maxWvhgt!: string; // 최대파고

  @Column()
  totalIndex!: string; // 종합지수

  @Column("double precision")
  lastScr!: number; // 종합점수
}
