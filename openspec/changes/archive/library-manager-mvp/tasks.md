## 1. 프로젝트 정리 및 DB 스키마

- [x] 1.1 기존 Todo 관련 코드 제거 (schema.ts의 todos 테이블, routes/_index.tsx의 todo UI, tests/todo.test.ts)
- [x] 1.2 books, categories, tags, book_tags, borrowings 테이블 스키마 작성 (app/db/schema.ts)
- [x] 1.3 Drizzle 마이그레이션 생성 및 적용

## 2. 레이아웃 및 인증 UI

- [x] 2.1 한국어 사이드바 레이아웃 컴포넌트 생성 (대시보드, 도서 관리, 대출 관리, 카테고리 메뉴)
- [x] 2.2 로그인/회원가입 페이지 생성 (/login, /signup)
- [x] 2.3 인증 미들웨어 추가 (비인증 사용자 → /login 리다이렉트)

## 3. 카테고리/태그 관리

- [x] 3.1 카테고리 CRUD 라우트 및 UI (/categories)
- [x] 3.2 태그 자동 생성 로직 (도서 등록/수정 시)

## 4. 도서 관리

- [x] 4.1 도서 등록 페이지 (/books/new) — 폼 + action
- [x] 4.2 도서 목록 페이지 (/books) — 테이블, 페이지네이션, 검색, 카테고리/태그 필터
- [x] 4.3 도서 상세 페이지 (/books/:id) — 전체 정보 표시 + 대출 버튼
- [x] 4.4 도서 수정 페이지 (/books/:id/edit)
- [x] 4.5 도서 삭제 기능 (대출 중 삭제 방지)

## 5. 대출/반납

- [x] 5.1 대출 신청 action (도서 상세에서 대출 버튼)
- [x] 5.2 반납 처리 action
- [x] 5.3 대출 현황 페이지 (/borrowings) — 대출 중 + 이력, 연체 표시

## 6. 대시보드

- [x] 6.1 대시보드 페이지 (/) — 통계 카드, 최근 활동, 연체 현황

## 7. 검증 및 정리

- [x] 7.1 빌드 확인 (tsc --noEmit, react-router build)
- [x] 7.2 기본 동작 테스트
