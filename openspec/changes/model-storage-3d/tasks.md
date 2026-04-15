## 1. 기존 도서 도메인 제거 및 스키마 변경

- [x] 1.1 books, bookTags, tags, borrowings 테이블 및 관련 relations 제거, models/modelTags 테이블 추가
- [x] 1.2 도서 관련 라우트 파일 제거 (books.tsx, books-new.tsx, book-detail.tsx, book-edit.tsx, borrowings.tsx, borrowings-new.tsx)
- [x] 1.3 도서 관련 컴포넌트 제거 (book-form, dashboard/overdue-list, dashboard/recent-books)
- [x] 1.4 validators.ts를 모델 도메인으로 재작성
- [x] 1.5 DB 스키마 적용 (db:push)

## 2. 파일 저장소 및 라우팅

- [x] 2.1 파일 저장 유틸리티 생성 (app/lib/storage.server.ts)
- [x] 2.2 라우트 설정 변경 (models/*, upload, 파일 API)
- [x] 2.3 사이드바 네비게이션 변경 (도서→모델)

## 3. 모델 CRUD

- [x] 3.1 모델 업로드 페이지 (/upload)
- [x] 3.2 모델 목록 페이지 (/models) — 그리드, 검색, 필터, 페이지네이션
- [x] 3.3 모델 상세 페이지 (/models/:id) — 메타데이터 + 3D 미리보기 + 다운로드
- [x] 3.4 모델 수정 페이지 (/models/:id/edit)
- [x] 3.5 모델 삭제 기능
- [x] 3.6 파일 다운로드/서빙 API 라우트

## 4. 3D 미리보기

- [x] 4.1 Three.js 의존성 설치
- [x] 4.2 3D 뷰어 컴포넌트 생성 (STL/GLTF 지원, ClientOnly 래퍼)

## 5. 카테고리 수정 및 대시보드

- [x] 5.1 카테고리 페이지 수정 (books→models 참조 변경)
- [x] 5.2 대시보드 컴포넌트 및 라우트 재작성 (모델 통계)

## 6. 검증

- [x] 6.1 빌드 확인 (tsc --noEmit, react-router build)
- [x] 6.2 개발 서버 동작 확인
