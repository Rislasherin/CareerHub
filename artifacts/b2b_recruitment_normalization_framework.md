# B2B SaaS Recruitment Platform: Generic Normalization & Matching Framework

This document outlines the architecture, data model, and implementation strategy for a generic normalization and matching framework designed for a production-grade B2B SaaS recruitment platform. This framework supports entities like Skills, Technologies, Job Titles, Certifications, and Industries, ensuring high data quality, performant search, and accurate matching.

## 1. Architectural Principles & Overview

The system is built on **Domain-Driven Design (DDD)**, **Clean Architecture**, and **SOLID principles**.

*   **Avoid String-Based Matching**: Free-text fields lead to fragmented data (e.g., "React.js", "ReactJS", "React"). All business-critical matching (e.g., matching a Candidate to a Job based on Skills) relies on foreign keys pointing to **Canonical Entities**.
*   **Generic Pipeline**: A single, reusable pipeline normalizes user input (whitespace, Unicode, case) and attempts to match it against known canonical records or their aliases.
*   **Canonical vs. Free-Text**: 
    *   *Canonical Entities*: Used for core matching (Skills, Titles, Universities).
    *   *Free-Text*: Used for descriptive fields (Bios, Job Descriptions) or transient user inputs before they are mapped to a canonical entity.

## 2. Data Model & PostgreSQL Schema

We use a generic two-table pattern that can be implemented per entity type (e.g., `skills`, `skill_aliases`) or as a unified polymorphic structure depending on the scale. For type safety and referential integrity, **separate tables per entity type** are recommended, but they share the exact same structural pattern.

### 2.1 Database Schema (PostgreSQL)

```sql
-- Enable necessary extensions for text search and fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 1. Canonical Entity Table (e.g., Skills)
CREATE TABLE canonical_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_name VARCHAR(255) NOT NULL, -- e.g., "React"
    normalized_name VARCHAR(255) NOT NULL UNIQUE, -- e.g., "react"
    category VARCHAR(100), -- e.g., "Frontend Framework"
    is_verified BOOLEAN DEFAULT false, -- True if verified by system admins
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Alias/Synonym Table
CREATE TABLE skill_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_skill_id UUID NOT NULL REFERENCES canonical_skills(id) ON DELETE CASCADE,
    alias_name VARCHAR(255) NOT NULL, -- e.g., "React.js"
    normalized_alias VARCHAR(255) NOT NULL UNIQUE, -- e.g., "react js"
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for Search and Fuzzy Matching
-- B-Tree for exact normalized matches
CREATE INDEX idx_canonical_skills_normalized ON canonical_skills(normalized_name);
CREATE INDEX idx_skill_aliases_normalized ON skill_aliases(normalized_alias);

-- GIN Trigram indexes for fast autocomplete and fuzzy searching (LIKE '%...%')
CREATE INDEX idx_canonical_skills_trgm ON canonical_skills USING gin (normalized_name gin_trgm_ops);
CREATE INDEX idx_skill_aliases_trgm ON skill_aliases USING gin (normalized_alias gin_trgm_ops);
```

**Migration Strategy**: Use tools like Prisma, TypeORM, or Flyway to manage these schema changes.

## 3. The Normalization Pipeline

The pipeline transforms raw user input into a standardized format before querying the database.

1.  **Unicode Normalization**: Convert characters to standard forms (e.g., `NFKC`). Remove diacritics using `unaccent`.
2.  **Case Normalization**: Convert to lowercase.
3.  **Whitespace Normalization**: Trim leading/trailing spaces and collapse multiple internal spaces into a single space.
4.  **Special Character Handling**: Standardize separators (e.g., replace `-` with space, remove `.`).

### 3.1 Pipeline Implementation (TypeScript)

```typescript
export class NormalizationService {
    /**
     * Normalizes a string for database matching and indexing.
     * Example: "  React.js  (v18)  " -> "react js v18"
     */
    public static normalize(input: string): string {
        if (!input) return "";

        return input
            .normalize("NFKC") // Unicode normalization
            .toLowerCase() // Case insensitive
            .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
            .replace(/[^\w\s+]/g, " ") // Replace punctuation with space (keep '+' for C++)
            .replace(/\s+/g, " ") // Collapse whitespace
            .trim();
    }
}
```

## 4. Domain & Application Services

Following Clean Architecture, we separate the Domain (Business Logic) from the Application (Use Cases) and Infrastructure (Database).

### 4.1 Domain Layer

```typescript
// Domain Entity
export class CanonicalEntity {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly normalizedName: string,
        public readonly isVerified: boolean,
        public readonly aliases: string[] = []
    ) {}
}

// Generic Repository Interface
export interface ICanonicalRepository {
    findByNormalizedName(normalizedName: string): Promise<CanonicalEntity | null>;
    findByAlias(normalizedAlias: string): Promise<CanonicalEntity | null>;
    searchFuzzy(query: string, limit: number): Promise<CanonicalEntity[]>;
    upsert(name: string, normalizedName: string): Promise<CanonicalEntity>;
}
```

### 4.2 Application Layer (Matching Engine)

The Matching Engine handles the logic of finding an existing entity or safely creating a new unverified one.

```typescript
import { NormalizationService } from '@domain/services/NormalizationService';
import { ICanonicalRepository, CanonicalEntity } from '@domain/interfaces/ICanonicalRepository';

export class EntityMatchingService {
    constructor(private readonly repository: ICanonicalRepository) {}

    /**
     * Resolves user input to a Canonical Entity. 
     * Creates an unverified entity if no match is found.
     */
    public async resolveEntity(rawInput: string): Promise<CanonicalEntity> {
        const normalizedInput = NormalizationService.normalize(rawInput);

        // 1. Try Exact Match on Canonical Name
        const exactMatch = await this.repository.findByNormalizedName(normalizedInput);
        if (exactMatch) return exactMatch;

        // 2. Try Exact Match on Aliases
        const aliasMatch = await this.repository.findByAlias(normalizedInput);
        if (aliasMatch) return aliasMatch;

        // 3. (Optional) Try Fuzzy Match with High Confidence Threshold
        // const fuzzyMatches = await this.repository.searchFuzzy(normalizedInput, 1);
        // if (fuzzyMatches.length > 0 && calculateScore(normalizedInput, fuzzyMatches[0]) > 0.95) return fuzzyMatches[0];

        // 4. No match found, create a new UNVERIFIED canonical entity
        // Uses UPSERT to prevent race conditions during high concurrency
        return await this.repository.upsert(rawInput.trim(), normalizedInput);
    }
}
```

### 4.3 Infrastructure Layer (Repository Implementation)

Handling concurrency and race conditions requires robust SQL `UPSERT` (`ON CONFLICT`) mechanisms.

```typescript
import { Pool } from 'pg';
import { ICanonicalRepository, CanonicalEntity } from '@domain/interfaces/ICanonicalRepository';

export class PostgresSkillRepository implements ICanonicalRepository {
    constructor(private readonly db: Pool) {}

    // ... (findByNormalizedName and findByAlias implementations) ...

    public async searchFuzzy(query: string, limit: number = 10): Promise<CanonicalEntity[]> {
        // Uses pg_trgm similarity score
        const sql = `
            SELECT id, canonical_name, normalized_name, is_verified,
                   similarity(normalized_name, $1) as score
            FROM canonical_skills
            WHERE normalized_name % $1 -- Requires pg_trgm threshold
            ORDER BY score DESC
            LIMIT $2;
        `;
        const result = await this.db.query(sql, [query, limit]);
        return result.rows.map(this.mapToEntity);
    }

    public async upsert(name: string, normalizedName: string): Promise<CanonicalEntity> {
        // Prevents duplicate creation during simultaneous requests (Race Conditions)
        const sql = `
            INSERT INTO canonical_skills (canonical_name, normalized_name, is_verified)
            VALUES ($1, $2, false)
            ON CONFLICT (normalized_name) 
            DO UPDATE SET updated_at = NOW()
            RETURNING id, canonical_name, normalized_name, is_verified;
        `;
        const result = await this.db.query(sql, [name, normalizedName]);
        return this.mapToEntity(result.rows[0]);
    }

    private mapToEntity(row: any): CanonicalEntity {
        return new CanonicalEntity(row.id, row.canonical_name, row.normalized_name, row.is_verified);
    }
}
```

## 5. Scalability & Performance Strategies

### 5.1 Caching Strategy (Redis)
For millions of searches, hitting PostgreSQL directly for every keystroke in an autocomplete dropdown is inefficient.
*   **Dictionary Cache**: Cache exact matches (`normalized_string` -> `canonical_id`) in Redis indefinitely. Invalidate only when an Admin merges or deletes an entity.
*   **Search Cache**: Cache fuzzy search results (e.g., query "rea" -> `[React, React Native, ReasonML]`) with a short TTL (e.g., 5-10 minutes).

### 5.2 ElasticSearch / OpenSearch Integration
While PostgreSQL `pg_trgm` is excellent up to a few million rows, a dedicated search engine like Elasticsearch is recommended for enterprise scale.
*   **Sync**: Use Change Data Capture (CDC) like Debezium to stream updates from Postgres to Elasticsearch.
*   **Matching**: ES provides built-in tokenizers, edge n-grams for fast autocomplete, and phonetic matching (e.g., Soundex) which handles misspellings better than Trigrams.

## 6. Managing User Generation & Data Quality

Allowing users to generate entities (e.g., typing a new skill "ReactJS 18") can quickly pollute the database. 

1.  **Status Flagging**: New entities are created with `is_verified = false`. They function normally for the user who created them.
2.  **Admin Review Queue**: A background job flags unverified entities that cross a certain usage threshold (e.g., used by >5 users).
3.  **Merge Tool**: Admins review the queue. If "ReactJS 18" means "React", the Admin merges it.
    *   The ID of "ReactJS 18" is updated across all Candidate/Job records to point to "React".
    *   "reactjs 18" is added to the `skill_aliases` table pointing to "React", ensuring future inputs are automatically resolved correctly.

## 7. Security & Audit Logging

*   **Validation**: Zod or Class-Validator ensures input strings do not exceed limits (e.g., 255 chars) before hitting the normalization pipeline, preventing DoS via excessive regex processing.
*   **Audit Logging**: Every merge, verification, or deletion of a canonical entity by an Admin is logged in an `audit_logs` table (Admin ID, Action, Old Value, New Value, Timestamp) to ensure accountability.

## 8. Summary of Architectural Decisions

| Decision | Rationale |
| :--- | :--- |
| **Separation of Normalization Logic** | Allows the normalization pipeline to be rigorously unit-tested against edge cases (Unicode, whitespace) independently of the database. |
| **Separate Alias Table** | Keeps the primary `canonical_skills` table small and fast. Simplifies the logic for handling multiple synonyms per entity. |
| **PostgreSQL Trigrams (`pg_trgm`)** | Provides excellent fuzzy matching capabilities directly in the primary datastore, delaying the architectural complexity of adding Elasticsearch until absolutely necessary. |
| **UPSERT (ON CONFLICT)** | Crucial for preventing race conditions when two users concurrently type a new, unrecognized skill, ensuring data integrity without locking tables. |
| **Verification Workflow** | Balances UX (users aren't blocked if a skill doesn't exist) with Data Quality (database doesn't become permanently polluted). |
