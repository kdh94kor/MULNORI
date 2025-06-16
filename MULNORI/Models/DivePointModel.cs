namespace DHTEST.Models
{
    public class DivePointModel
    {
        public string skscExpcnRgnNm { get; set; }  // 지역명
        public double lat { get; set; }             // 위도
        public double lot { get; set; }             // 경도
        public string predcYmd { get; set; }        // 예측일
        public string predcNoonSeCd { get; set; }   // 오전/오후
        public string tdlvHrCn { get; set; }        // 조석정보
        public string minWvhgt { get; set; }        // 최소파고
        public string maxWvhgt { get; set; }        // 최대파고
        public string totalIndex { get; set; }      // 종합지수
        public double lastScr { get; set; }         // 종합점수
    }
}
