## ADDED Requirements

### Requirement: 3D 모델 미리보기
시스템은 STL 및 GLTF/GLB 파일을 브라우저에서 3D로 미리보기할 수 있어야 한다.

#### Scenario: STL 파일 미리보기
- **WHEN** 사용자가 STL 모델 상세 페이지 접근
- **THEN** Three.js 기반 3D 렌더링이 표시되고 마우스로 회전/줌 가능

#### Scenario: GLTF 파일 미리보기
- **WHEN** 사용자가 GLTF/GLB 모델 상세 페이지 접근
- **THEN** Three.js 기반 3D 렌더링이 표시되고 마우스로 회전/줌 가능

#### Scenario: 지원되지 않는 파일 형식
- **WHEN** 사용자가 OBJ 모델 상세 페이지 접근
- **THEN** "이 파일 형식은 미리보기를 지원하지 않습니다" 메시지와 파일타입 아이콘이 표시됨
