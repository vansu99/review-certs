# Review Business Rules

## Purpose

Review Center helps learners decide what to study next. It uses exam attempts, question answers, topics, bookmarks, and certification tracks to generate a focused review queue.

The main business question is:

> What should this learner review now to improve their chance of passing?

## Core Concepts

### Readiness

Readiness is a learner-facing estimate of preparation level for one or more certification tracks.

The MVP score is calculated from:

- Average score from completed attempts
- Pass rate against each exam passing score
- Coverage, based on attempted exams over available exams

Interpretation:

| Range | Meaning |
| --- | --- |
| `0-64%` | Not ready. Learner should focus on weak topics and mistakes. |
| `65-84%` | Developing. Learner should continue practice and take mock exams. |
| `85-100%` | Likely ready. Learner should validate with full exam simulation. |

Readiness is a guide, not a certificate result.

### Due Questions

Due questions are questions the learner answered incorrectly before and should review again.

In the current MVP, due questions are derived from historical incorrect answers. A later spaced repetition version can add scheduling fields such as `next_review_at`, `review_interval`, and `mastery_state`.

### Weak Topics

A weak topic is a question topic where the learner accuracy is below the mastery threshold.

Current threshold:

```text
accuracy < 70%
```

Topics come from `questions.topic`. If no topic is assigned, the system groups it as `General`.

## Review Modes

### Mistakes

Shows questions the learner answered incorrectly before.

Use this for:

- Fast remediation
- Relearning misunderstood concepts
- Reviewing before another attempt

### Weak Topics

Shows questions from topics where the learner accuracy is low.

Use this for:

- Domain-focused study
- Certification objective preparation
- Identifying repeated concept gaps

### Bookmarked

Shows questions from bookmarked exams.

Use this for:

- User-curated review
- Hard questions the learner wants to revisit
- Personal study lists

### Mixed

Shows recent review material from attempts.

Use this for:

- General daily study
- Keeping a broad practice rhythm
- Users who do not know where to start

## Learner Flow

1. Learner takes a practice exam.
2. System stores attempt answers.
3. Review Center calculates readiness, weak topics, and due question count.
4. Learner chooses a track and review mode.
5. Learner reviews questions with correct answers and explanations.
6. Learner retakes practice exams to improve readiness.

## Admin Flow

Admins and Managers improve review quality by:

- Assigning meaningful `topic` values to questions.
- Keeping certification tracks published only when ready.
- Writing useful explanations for each question.
- Using consistent topic names across exams in the same track.

## Data Sources

Review Center currently uses existing tables:

| Table | Usage |
| --- | --- |
| `categories` | Certification track metadata |
| `tests` | Exam availability and passing score |
| `questions` | Question content and topic |
| `answer_options` | Correct answers for review |
| `test_attempts` | User score and completion history |
| `test_attempt_answers` | Per-question correctness |
| `bookmarks` | User-saved exams |

## Future Extension: Spaced Repetition

The next iteration should add a per-user question review table:

```text
user_question_reviews
- id
- user_id
- question_id
- mastery_state: new | learning | reviewing | mastered
- last_reviewed_at
- next_review_at
- interval_days
- ease_factor
- consecutive_correct
- created_at
- updated_at
```

This enables true scheduled review instead of deriving due questions only from incorrect historical answers.

## Product Principle

The learner should not need to guess what to study. The system should recommend the next best review action from evidence in their own attempts.
