## ADDED Requirements

### Requirement: 파일 저장
시스템은 업로드된 3D 모델 파일을 로컬 파일시스템에 저장해야 한다. 경로: `storage/models/{uuid}/model.{ext}`

#### Scenario: 파일 저장 성공
- **WHEN** 모델이 업로드될 때
- **THEN** 파일이 `storage/models/{uuid}/model.{ext}` 경로에 저장됨

### Requirement: 파일 삭제
시스템은 모델 삭제 시 관련 파일도 함께 삭제해야 한다.

#### Scenario: 모델 삭제 시 파일 정리
- **WHEN** 모델이 삭제될 때
- **THEN** `storage/models/{uuid}/` 디렉토리 전체가 삭제됨

### Requirement: 파일 서빙
시스템은 저장된 모델 파일을 HTTP로 제공해야 한다 (3D 미리보기 및 다운로드 용).

#### Scenario: 파일 서빙
- **WHEN** 클라이언트가 `/api/models/:id/file` 요청
- **THEN** 적절한 Content-Type으로 파일이 응답됨
