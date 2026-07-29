# Category Business Rules

## Purpose

In Review Certs, a Category represents a certification track, not just a folder for exams. It defines the learning catalog item that learners choose when they want to practice toward a certificate or skill milestone.

Examples:

- AWS Solutions Architect Associate
- Azure Fundamentals
- JavaScript Fundamentals
- React Essentials

## Data Model

Each Category should describe both the learner-facing track and the admin catalog metadata.

| Field | Meaning |
| --- | --- |
| `name` | Learner-facing track name |
| `slug` | Stable URL/search identifier generated from the name |
| `description` | What the track covers |
| `icon` | Short visual marker, for example `AWS`, `JS`, `CERT` |
| `provider` | Issuer or owner, for example AWS, Microsoft, Google, Review Certs |
| `certificationCode` | Certificate/exam code, for example `SAA-C03` |
| `level` | `Foundation`, `Associate`, `Professional`, or `Specialty` |
| `version` | Curriculum or exam version |
| `status` | `draft`, `published`, or `archived` |
| `displayOrder` | Admin-controlled ordering in the catalog |
| `defaultPassingScore` | Default target pass score for this track |
| `estimatedHours` | Estimated preparation effort |

## Status Lifecycle

### Draft

Use draft while the track is being prepared.

- Admins and Managers can see and edit draft tracks.
- Learners cannot see draft tracks.
- Exams can be created under draft tracks for preparation.

### Published

Use published when the track is ready for learners.

- Learners can see the track in the Category list.
- Learners can open its exams.
- Learners can create goals for the track.

### Archived

Use archived when a track should no longer be selected by learners.

- Learners cannot see archived tracks.
- Existing tests, attempts, goals, and analytics are preserved.
- New exams cannot be added to archived tracks.
- Archive is preferred over deletion because certification history must remain auditable.

## Permissions

| Action | User | Manager | Admin | Super Admin |
| --- | --- | --- | --- | --- |
| View published tracks | Yes | Yes | Yes | Yes |
| View draft/archived tracks | No | Yes | Yes | Yes |
| Create/update tracks | No | Yes | Yes | Yes |
| Archive tracks | No | Yes | Yes | Yes |

## Exam Rules

- Exams belong to one Category.
- Exams can be created in draft or published Categories.
- Exams cannot be created in archived Categories.
- Archiving a Category does not archive or delete exams.

## Goal Rules

- Learners can create Category goals only from published Categories.
- When a Category goal is created, the system snapshots the current exam IDs into the goal.
- This prevents a learner's goal from changing unexpectedly when admins later add or remove exams.

## UI/UX Rules

Learner-facing Category cards should answer three questions quickly:

- What certification track is this?
- How much effort is expected?
- What does passing look like?

Admin-facing Category cards should additionally show the track status so draft and archived content are not confused with published content.

## Operational Guidance

Create a new Category as `draft`, fill in metadata, add exams, then switch it to `published` when ready.

Archive old certificate versions instead of deleting them. For example, when moving from `SAA-C03` to a future version, archive the old track and create a new track with the new version/code.

Avoid renaming a published Category in a way that changes its meaning. If the exam scope changes significantly, create a new versioned Category instead.
