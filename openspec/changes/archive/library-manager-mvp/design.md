## Context

보일러플레이트(React Router v7 + Drizzle ORM + Better Auth + SQLite + Shadcn UI)를 기반으로 도서관 관리 웹앱 MVP를 구축한다. 기존 인증 시스템(Better Auth)과 UI 컴포넌트(Shadcn)를 그대로 활용하며, 도서/카테고리/대출 도메인 로직을 추가한다.

현재 상태: Todo CRUD 샘플만 존재. 도서 관련 스키마/라우트 없음.

## Goals / Non-Goals

**Goals:**
- 도서 CRUD, 카테고리/태그, 검색, 대출/반납의 완전한 기능 구현
- 관리자 대시보드로 현황 파악
- 한국어 UI
- SQLite 단일 파일 DB로 간단한 배포

**Non-Goals:**
- 다국어 지원 (한국어 전용)
- 도서 표지 이미지 업로드 (URL만 지원)
- 역할 기반 권한 분리 (MVP에서는 모든 인증된 사용자가 동일 권한)
- 알림/이메일 시스템
- 외부 도서 API 연동 (ISBN 자동 검색 등)

## Decisions

### 1. DB 스키마 설계
- **books** 테이블: id, title, author, isbn, publisher, publishedDate, description, coverImageUrl, categoryId (FK), createdAt, updatedAt
- **categories** 테이블: id, name, description, parentId (자기참조 FK, 계층 구조)
- **tags** 테이블: id, name
- **book_tags** 조인 테이블: bookId, tagId
- **borrowings** 테이블: id, bookId (FK), userId (FK), borrowedAt, dueDate, returnedAt, status (borrowed/returned/overdue)
- todos 테이블 제거
- **왜?**: 정규화된 관계형 설계. SQLite에서 효율적. 카테고리는 단일 계층(parentId)으로 단순화.

### 2. 라우팅 구조
```
/ → 대시보드
/login → 로그인
/signup → 회원가입
/books → 도서 목록 (검색/필터 포함)
/books/new → 도서 등록
/books/:id → 도서 상세
/books/:id/edit → 도서 수정
/borrowings → 대출 현황
/categories → 카테고리 관리
```
- **왜?**: React Router v7의 file-based routing 활용. RESTful 패턴.

### 3. 데이터 로딩 패턴
- React Router의 loader/action 패턴 사용 (서버 사이드)
- 별도 API 엔드포인트 없이 loader에서 직접 DB 쿼리
- **왜?**: React Router v7 프레임워크 모드의 권장 패턴. SSR로 초기 로딩 빠름.

### 4. 검색 구현
- SQLite LIKE 쿼리로 제목/저자/ISBN 검색
- URL 쿼리 파라미터로 검색어/필터 전달
- **왜?**: MVP 수준에서 FTS(Full Text Search) 불필요. LIKE로 충분.

### 5. UI 구조
- Shadcn Sidebar 레이아웃 사용
- DataTable (Shadcn Table + 수동 페이지네이션)
- Form: Shadcn Field + Input + Select 등 조합
- Toast: Sonner로 성공/에러 피드백

## Risks / Trade-offs

- **[SQLite 동시성]** → 단일 서버 MVP이므로 문제 없음. 확장 시 PostgreSQL 마이그레이션 고려.
- **[LIKE 검색 성능]** → 수천 건 이하에서 충분. 대규모 시 FTS5 확장 고려.
- **[권한 미분리]** → MVP에서는 모든 로그인 사용자가 관리자. 추후 role 필드 추가로 확장.
- **[이미지 URL만 지원]** → 외부 이미지 링크 깨질 수 있음. 추후 파일 업로드 추가 가능.
