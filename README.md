# Naver-Cafe-Twitch-Clip-Extension
> 해당 레포는 다음의 forked 입니다 : [nomomo/Naver-Cafe-Twitch-Clip-Loader](https://github.com/nomomo/Naver-Cafe-Twitch-Clip-Loader)

- 본 익스텐션은 네이버 카페 글(PC 버전)에서 Twitch 클립 링크를 감지하는 경우, <br/>카페 글 내에서 바로 재생 가능한 비디오로 변환해줍니다. (편하다!)
- 설정에서 링크를 비디오로 변환할 시점을 선택할 수 있습니다. <br/>(페이지 로딩 시 자동 변환 or 링크 클릭 시 변환)

## Preview

- 단순 링크의 경우 변환하지 않으며, 아래 그림과 같이 Twitch Clip 의 썸네일이 있는 링크만 변환합니다.

![Preview](/images/NCTCL_preview_01.png)

![Open Settings Menu](/images/NCTCL_preview_02.png)

![Settings](/images/NCTCL_preview_03.png)

## Install
- [익스텐션 설치링크](https://chrome.google.com/webstore/detail/anfmlkmmakldmlaboibhmmfnjgmpbffc)

> 주의: 본 익스텐션 설치 및 사용하며 브라우저 과부하로 인한 응답 없음 등 으로 인한 데이터 손실 등 문제 발생 시 개발자는 책임지지 않습니다.  
> Naver Cafe 접속에 문제가 생기거나 클립 재생이 안 되는 문제 등이 발생하는 경우, 익스텐션 메뉴에서 이 익스텐션을 끄거나 삭제해주세요.

## Bug report

- 버그 리포트 & 건의사항은 아래의 링크로 보내주세요.
- getCurrentThread@gmail.com

## Change log

### 0.0.3 (Mar. 14, 2022)

- 단일 익스텐션으로 변경
- 문서와 소스코드 내의 기존 관련 내용 수정

### 0.0.2 (Mar. 02, 2022)

- 페이지 로딩 시점에 변환할 개수 제한 설정 추가 (클립 많은 글에서 심하게 느려지는 현상 방지)
- `https://www.twitch.tv/[스트리머 ID]/clip/[클립 UID]` 형태의 링크 감지하도록 함

### 0.0.1 (Jan. 09, 2022)

- 최초 커밋