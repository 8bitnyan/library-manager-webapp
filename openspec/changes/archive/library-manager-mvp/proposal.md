## Why

도서관/미디어 자료를 관리할 수 있는 웹 애플리케이션이 필요하다. 사서 및 이용자가 도서 등록, 검색, 대출/반납을 체계적으로 처리할 수 있는 시스템을 구축한다. 기존 보일러플레이트(React Router v7 + Drizzle + Better Auth + SQLite)를 활용하여 빠르게 MVP를 완성한다.

## What Changes

- 도서(Book) CRUD 기능 추가 — 제목, 저자, ISBN, 출판사, 출판일, 설명, 표지 이미지 URL 관리
- 카테고리/태그 시스템 추가 — 도서 분류 및 태그 기반 필터링
- 검색 기능 추가 — 제목, 저자, ISBN 기반 전문 검색
- 대출/반납 시스템 추가 — 이용자별 대출 이력, 반납 기한 관리, 연체 표시
- 대시보드 추가 — 총 도서 수, 대출 현황, 연체 현황, 최근 활동 통계
- 한국어 UI 적용
- 기존 Todo 기능 제거 (보일러플레이트 샘플)

## Capabilities

### New Capabilities
- `book-management`: 도서 CRUD (등록, 조회, 수정, 삭제), 도서 목록 페이지네이션
- `category-tag`: 카테고리 계층 관리 및 태그 시스템, 도서-카테고리/태그 연결
- `search`: 제목, 저자, ISBN 기반 검색 및 카테고리/태그 필터링
- `borrowing`: 대출 신청, 반납 처리, 대출 이력 조회, 연체 관리
- `dashboard`: 관리자 대시보드 — 통계, 최근 활동, 연체 현황

### Modified Capabilities
<!-- 없음 — 신규 프로젝트 -->

## Impact

- **DB 스키마**: books, categories, tags, book_tags, borrowings 테이블 추가, todos 테이블 제거
- **라우트**: 기존 `_index.tsx` 대시보드로 교체, `/books`, `/books/:id`, `/borrowings`, `/categories` 라우트 추가
- **인증**: 기존 Better Auth 활용, 로그인/회원가입 페이지 추가
- **의존성**: 변경 없음 (기존 shadcn + lucide + date-fns 등 활용)
