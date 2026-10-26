# Platform Architecture & Design

This document details the system design, database schema, and workflows of the **Cloud-Based AI Software Testing Platform**.

## System Flow Diagram

```mermaid
graph TD
    User([User]) -->|ZIP Upload| ReactFront[React Frontend]
    ReactFront -->|POST /api/projects/upload| SBBackend[Spring Boot Backend]
    
    subgraph Data & Storage
        SBBackend -->|Metadata| H2DB[(H2 Database / PostgreSQL)]
        SBBackend -->|ZIP File| LocalStorage[(Local Storage / AWS S3)]
    end

    subgraph Phase 1 Processing
        SBBackend -->|ZIP Security Validate| ZipExtract[Secure ZIP Extraction]
        ZipExtract -->|Scan .java| Parser[File Hierarchy Scanner]
        Parser -->|Register Files| H2DB
    end

    subgraph Future Compute (Phase 3)
        SBBackend -->|Execute Job| TestRunner{Test Runner Engine}
        TestRunner -->|Option A: Dev| LocalProc[Local Process - mvn test]
        TestRunner -->|Option B: Cloud| ECS[AWS ECS Fargate Task]
    end
```

## Database Schema (Entities)

### `Project` Entity
- `id` (UUID): Unique project identifier.
- `name` (String): The original file name.
- `storagePath` (String): Path to the uploaded ZIP file.
- `createdAt` (Timestamp): Upload timestamp.
- `status` (String): Active status (e.g., `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`).

### `SourceFile` Entity
- `id` (UUID): Unique file identifier.
- `project` (ManyToOne -> Project): Parent project link.
- `filePath` (String): Relative path of the Java file (e.g., `src/main/java/com/example/Calculator.java`).
- `className` (String): Extracted class name.
- `content` (CLOB/TEXT): Source code contents.
- `createdAt` (Timestamp): Registration timestamp.

## Security Controls
1. **Zip Slip Prevention**: Validates that all extracted entries remain strictly within the designated temporary directory.
2. **File Size Enforcement**: Limit multipart file uploads to a maximum of 50MB.
3. **File Extension Verification**: Only allow files with `.zip` extension to be processed.
