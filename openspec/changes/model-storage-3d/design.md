## Context

기존 도서관 관리 앱의 인프라(Better Auth 인증, 사이드바 레이아웃, 카테고리 관리)를 재활용하여 3D 모델 저장소로 전환한다. 도서/대출 관련 코드를 모두 제거하고, 3D 모델 업로드/저장/미리보기 기능을 추가한다.

## Goals / Non-Goals

**Goals:**
- 3D 모델 파일(STL, OBJ, GLTF/GLB) 업로드 및 관리
- Three.js 기반 브라우저 내 3D 미리보기
- 카테고리/태그 기반 분류 및 검색
- 모델 통계 대시보드
- 한국어 UI

**Non-Goals:**
- 모델 파일 변환 (STL→OBJ 등)
- 멀티 유저 권한 분리 (MVP에서는 모든 인증 사용자 동일 권한)
- 외부 클라우드 스토리지 (로컬 파일시스템만)
- 모델 버전 관리

## Decisions

### 1. 파일 저장소
- `storage/models/{uuid}/` 디렉토리에 원본 파일 저장
- 파일명: `{uuid}/model.{ext}` (원본 확장자 유지)
- Node.js fs API (Bun 호환) 사용
- **왜?**: MVP에 충분. S3 등은 추후 추상화 가능.

### 2. DB 스키마
- **models** 테이블: id (UUID text PK), name, description, fileType (stl/obj/gltf/glb), fileSize (bytes), categoryId (FK), createdAt, updatedAt
- **modelTags** 조인 테이블: modelId (FK), tag (text), composite PK
- categories 테이블 유지 (기존 그대로)
- tags 테이블 제거 → modelTags에 tag를 직접 text로 저장 (단순화)
- books, bookTags, borrowings 테이블 제거

### 3. 3D 미리보기
- Three.js + STLLoader/GLTFLoader 사용
- 클라이언트 전용 컴포넌트 (SSR 불가 → React.lazy + ClientOnly 패턴)
- OrbitControls로 회전/줌
- OBJ는 미리보기 미지원 (다운로드만 제공)

### 4. 라우팅
```
/ → 대시보드
/models → 모델 목록 (검색/필터)
/upload → 모델 업로드
/models/:id → 모델 상세 + 3D 미리보기
/models/:id/edit → 모델 수정
/categories → 카테고리 관리
/login, /signup → 인증 (기존 유지)
```

### 5. 파일 업로드
- React Router action에서 `request.formData()` 사용
- 최대 파일 크기: 50MB
- multipart/form-data 처리

## Risks / Trade-offs

- **[Three.js SSR]** → clientOnly 래퍼로 해결. SSR 시에는 플레이스홀더 표시.
- **[로컬 파일 저장]** → 서버 재시작 시 파일 유지됨. 단, 컨테이너 환경에서는 볼륨 마운트 필요.
- **[대용량 파일]** → 50MB 제한. Bun의 formData 파싱으로 충분.
- **[OBJ 미리보기 미지원]** → MVP 범위 축소. STL/GLTF만 지원.
