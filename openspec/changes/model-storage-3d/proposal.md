## Why

3D 모델 파일(STL, OBJ, GLTF)을 업로드, 저장, 분류, 검색, 미리보기할 수 있는 웹 애플리케이션이 필요하다. 기존 도서관 관리 앱의 인프라(인증, 레이아웃, 사이드바)를 재활용하되, 도메인을 3D 모델 저장소로 완전히 전환한다.

## What Changes

- **BREAKING**: 기존 도서(Book) 관련 테이블/라우트/컴포넌트 전체 제거 (books, bookTags, borrowings 테이블, 관련 라우트 및 UI)
- 3D 모델(Model) 테이블 추가 — 이름, 설명, 파일 타입, 파일 크기, 카테고리, 썸네일
- 모델 파일 업로드/다운로드 시스템 추가 (로컬 파일 시스템 `storage/models/` 경로)
- Three.js 기반 3D 모델 미리보기(STL/GLTF) 추가
- 태그 시스템 변경 — model_tags 조인 테이블로 전환
- 카테고리 관리 유지 (계층 구조 그대로)
- 검색 기능 유지 (모델명, 설명 기반)
- 대시보드 변경 — 모델 통계, 카테고리별 분포, 최근 업로드

## Capabilities

### New Capabilities
- `model-management`: 3D 모델 CRUD (업로드, 조회, 수정, 삭제), 파일 저장/다운로드
- `model-preview`: Three.js 기반 STL/GLTF 3D 뷰어 (OrbitControls, 조명)
- `file-storage`: 로컬 파일 시스템 기반 모델 파일 저장/관리

### Modified Capabilities
- `category-tag`: 도서→모델 도메인으로 변경, book_tags→model_tags
- `search`: 도서→모델 검색으로 변경
- `dashboard`: 도서 통계→모델 통계로 변경, 대출 현황 제거

## Impact

- **DB 스키마**: books, bookTags, borrowings 테이블 제거; models, modelTags 테이블 추가
- **라우트**: /books/*, /borrowings/* 제거; /models/*, /upload 추가
- **컴포넌트**: 도서 관련 컴포넌트 제거; 모델 카드, 3D 뷰어, 파일 업로드 컴포넌트 추가
- **의존성**: three.js, @types/three 추가
- **파일 시스템**: storage/models/ 디렉토리 구조 추가
