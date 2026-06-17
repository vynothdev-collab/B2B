# PeopleDataLabs API — Integration Analysis
## Person Search & Company Search Field Mapping

> **Base URL:** `https://api.peopledatalabs.com/v5`
> **Person Search endpoint:** `POST /person/search`
> **Company Search endpoint:** `POST /company/search`
> **Auth:** `X-Api-Key: <your_key>` header or `api_key` query param

---

## Table of Contents
1. [Query Format Recommendation](#1-query-format-recommendation)
2. [Person Search — Field Mapping](#2-person-search--field-mapping)
3. [Company Search — Field Mapping](#3-company-search--field-mapping)
4. [Not Implementable / Limitations](#4-not-implementable--limitations)
5. [Enum Reference](#5-enum-reference)
6. [Example Queries](#6-example-queries)

---

## 1. Query Format Recommendation

PDL supports two query formats passed as request body parameters:

| Parameter | Format | Description |
|-----------|--------|-------------|
| `query` | Elasticsearch DSL (JSON) | Full ES bool/term/match/range/wildcard operators |
| `sql` | SQL string | SQL `SELECT * FROM person WHERE ...` |

### ✅ Recommendation: **Use Elasticsearch DSL (`query` parameter)**

**Reasons:**

1. PDL runs on Elasticsearch natively — ES DSL is the first-class format
2. `skills`, `languages`, `certifications`, `experience` are **array fields** — ES DSL handles them correctly; SQL struggles with array lookups
3. Boolean logic (`must` / `should` / `must_not` / `filter`) gives precise AND/OR/NOT control without SQL string building
4. `range` queries on integers and dates are clean and expressive
5. `match` queries handle partial text / relevance; SQL `LIKE` has no relevance scoring
6. `wildcard` and `exists` operators have no clean SQL equivalent for nested fields
7. Python dicts map directly to ES DSL — no SQL string injection risk

**When SQL is acceptable:** Simple single-condition lookups on flat string/enum fields only.

### Request Structure

```json
POST https://api.peopledatalabs.com/v5/person/search
Headers: { "X-Api-Key": "<key>", "Content-Type": "application/json" }

{
  "query": { ...elasticsearch DSL... },
  "size": 10,
  "from": 0,
  "dataset": "all",
  "pretty": false,
  "titlecase": false
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | Object | Elasticsearch DSL query object |
| `sql` | String | Alternative: SQL query string |
| `size` | Integer | Results per page (max 100, default 10) |
| `from` | Integer | Offset for pagination (max 10,000) |
| `scroll_token` | String | Token for deep pagination beyond 10,000 |
| `dataset` | String | `"all"` (default) or specific dataset |
| `pretty` | Boolean | Pretty-print JSON response |
| `titlecase` | Boolean | Return names in Title Case |

---

## 2. Person Search — Field Mapping

### 2.1 Name & LinkedIn

| UI Field | PDL API Field | Type | Query Operator | Notes |
|----------|--------------|------|----------------|-------|
| First name | `first_name` | String | `match` | Case-insensitive partial match |
| Last name | `last_name` | String | `match` | Case-insensitive partial match |
| LinkedIn URL | `linkedin_url` | String | `term` | Exact match, lowercase. e.g. `linkedin.com/in/username` |

**ES DSL example:**
```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "first_name": "john" } },
        { "match": { "last_name": "smith" } },
        { "term": { "linkedin_url": "linkedin.com/in/johnsmith" } }
      ]
    }
  }
}
```

---

### 2.2 Profile Details

| UI Field | PDL API Field | Type | Query Operator | Notes |
|----------|--------------|------|----------------|-------|
| Headline contains | `headline` | String | `match` | Free-text relevance search on LinkedIn-style headline |
| Summary contains | `summary` | String | `match` | Free-text search on user bio/summary. Stored lowercase |
| Twitter handle | `twitter_username` | String | `term` | Exact username (without @) |
| Languages | `languages.name` | Array[Object] | `term` | Nested field. Value: lowercase language name e.g. `"english"`, `"spanish"` |
| Skills | `skills` | Array[String] | `term` | Exact skill string match. Self-reported, not canonical |
| Certifications | `certifications.name` | Array[Object] | `match` | Match on certification name string |
| Degree | `education.degrees` | Array[Enum] | `term` | Canonical enum — see [Degree Enums](#degree-enums) |
| School | `education.school.name` | Array[Object] | `match` | School name text match |
| Field of study | `education.majors` | Array[Enum] | `term` | Canonical enum e.g. `"computer science"`, `"business administration"` |
| LinkedIn connections | `linkedin_connections` | Integer (0–500) | `range` | PDL caps display at 500. Use `gte`/`lte` |

**ES DSL example:**
```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "headline": "software engineer" } },
        { "term": { "skills": "python" } },
        { "term": { "languages.name": "english" } },
        { "term": { "education.degrees": "bachelors" } },
        { "match": { "education.school.name": "stanford" } }
      ],
      "filter": [
        { "range": { "linkedin_connections": { "gte": 500 } } }
      ]
    }
  }
}
```

---

### 2.3 Title & Seniority

| UI Field | PDL API Field | Type | Query Operator | Notes |
|----------|--------------|------|----------------|-------|
| Job title | `job_title` | String | `match` or `wildcard` | Free-text current job title |
| Seniority | `job_title_levels` | Array[Enum] | `term` | See [Level Enums](#level-enums). Multi-value: use `should` |
| Function | `job_title_role` | Enum | `term` | 25 canonical roles — see [Role Enums](#role-enums) |
| Total years experience | `inferred_years_experience` | Integer (0–100) | `range` | PDL-calculated total years |

> **Note on Function:** `job_title_role` is the high-level function (e.g. `engineering`, `sales`). For granular sub-function use `job_title_sub_role` (140+ values e.g. `software`, `account_executive`).

**ES DSL example:**
```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "job_title": "product manager" } }
      ],
      "should": [
        { "term": { "job_title_levels": "senior" } },
        { "term": { "job_title_levels": "manager" } }
      ],
      "filter": [
        { "term": { "job_title_role": "product" } },
        { "range": { "inferred_years_experience": { "gte": 5, "lte": 15 } } }
      ],
      "minimum_should_match": 1
    }
  }
}
```

---

### 2.4 Current Company

| UI Field | PDL API Field | Type | Query Operator | Notes |
|----------|--------------|------|----------------|-------|
| Company name | `job_company_name` | String | `match` | Current employer name, lowercased |
| Company LinkedIn URL | `job_company_linkedin_url` | String | `term` | Exact URL match |
| Company domain | `job_company_website` | String | `term` or `wildcard` | e.g. `"microsoft.com"` |
| Industry | `job_company_industry` | Enum | `term` | See [Industry Enums](#industry-enums) — 148 values |
| Company headcount (range) | `job_company_employee_count` | Integer | `range` | Raw employee count |
| Company headcount (bucket) | `job_company_size` | Enum | `term` | Size band — see [Size Enums](#size-enums) |

> **Use `job_company_size` (enum bucket) for dropdowns.** Use `job_company_employee_count` (range) for min/max sliders.

**ES DSL example:**
```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "job_company_name": "google" } }
      ],
      "filter": [
        { "term": { "job_company_industry": "computer software" } },
        { "term": { "job_company_size": "1001-5000" } }
      ]
    }
  }
}
```

---

### 2.5 Past Roles & Companies

> **How past experience works in PDL:** The `experience` field is an array of all job objects. The current job has `is_primary: true`. Past jobs have `is_primary: false`. The `job_history` field is a flatter secondary array.

| UI Field | PDL API Field | Type | Query Operator | Notes |
|----------|--------------|------|----------------|-------|
| Past companies | `experience.company.name` | Array[Object] | `match` | Matches any entry in experience array (past + current). Use `must_not` on `job_company_name` to isolate past only |
| Past titles | `experience.title.name` | Array[Object] | `match` | Same — matches across all experience entries |
| Past seniority | `experience.title.levels` | Array[Enum] | `term` | Level enum in past experience |
| Past function | `experience.title.role` | Array[Object] | `term` | Role enum in past experience |

> ⚠️ **Important caveat:** PDL's `experience` array is a **flattened field** (not a true Elasticsearch nested type). This means a query on `experience.company.name = "Google"` AND `experience.title.levels = "cxo"` does **NOT** guarantee they were CXO *at Google* — it means they have Google somewhere in experience AND CXO somewhere in experience. True cross-field nested filtering on experience is **not supported** by PDL's query engine.

**ES DSL example:**
```json
{
  "query": {
    "bool": {
      "filter": [
        { "match": { "experience.company.name": "microsoft" } },
        { "term": { "experience.title.role": "engineering" } }
      ]
    }
  }
}
```

---

### 2.6 Person Location

| UI Field | PDL API Field | Type | Query Operator | Notes |
|----------|--------------|------|----------------|-------|
| Country / region | `location_country` | Enum | `term` | Lowercase country name e.g. `"united states"`, `"india"` |
| State / province | `location_region` | String | `term` | Lowercase state name e.g. `"california"`, `"texas"` |
| City | `location_locality` | String | `term` or `match` | Lowercase city name e.g. `"san francisco"` |

**ES DSL example:**
```json
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "location_country": "united states" } },
        { "term": { "location_region": "california" } },
        { "term": { "location_locality": "san francisco" } }
      ]
    }
  }
}
```

---

### 2.7 Company HQ Location (on Person record)

| UI Field | PDL API Field | Type | Query Operator | Notes |
|----------|--------------|------|----------------|-------|
| HQ country / region | `job_company_location_country` | Enum | `term` | Country of current employer HQ |
| HQ state | `job_company_location_region` | String | `term` | State/province of HQ |
| HQ city | `job_company_location_locality` | String | `term` | City of HQ |

**ES DSL example:**
```json
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "job_company_location_country": "united states" } },
        { "term": { "job_company_location_region": "new york" } }
      ]
    }
  }
}
```

---

## 3. Company Search — Field Mapping

### 3.1 Company Name & Domain

| UI Field | PDL API Field | Type | Query Operator | Notes |
|----------|--------------|------|----------------|-------|
| Company name | `name` | String | `match` | Lowercased. Use `display_name` for output |
| Website domain | `website` | String | `term` or `wildcard` | e.g. `"google.com"` — no `https://` |

**ES DSL example:**
```json
{
  "query": {
    "bool": {
      "should": [
        { "match": { "name": "stripe" } },
        { "term": { "website": "stripe.com" } }
      ],
      "minimum_should_match": 1
    }
  }
}
```

---

### 3.2 Industry & Type

| UI Field | PDL API Field | Type | Query Operator | Notes |
|----------|--------------|------|----------------|-------|
| Industry | `industry` | Enum | `term` | 148 canonical values — see [Industry Enums](#industry-enums) |
| Type | `type` | Enum | `term` | 6 values: `private`, `public`, `nonprofit`, `government`, `educational`, `public_subsidiary` |
| Stock exchange | `mic_exchange` | Enum | `term` | MIC code e.g. `"XNAS"` (NASDAQ), `"XNYS"` (NYSE). Full list at ISO 10383 |

**ES DSL example:**
```json
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "industry": "financial services" } },
        { "term": { "type": "public" } },
        { "term": { "mic_exchange": "XNAS" } }
      ]
    }
  }
}
```

---

### 3.3 HQ Location

| UI Field | PDL API Field | Type | Query Operator | Notes |
|----------|--------------|------|----------------|-------|
| HQ country / region | `location.country` | String | `term` | Lowercase country name |
| HQ state / province | `location.region` | String | `term` | Lowercase state/province |
| HQ city | `location.locality` | String | `term` or `match` | Lowercase city |
| Most employees in | `employee_count_by_country` | Object | ⚠️ LIMITED | See [Limitations](#4-not-implementable--limitations) |

**ES DSL example:**
```json
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "location.country": "united states" } },
        { "term": { "location.region": "california" } },
        { "term": { "location.locality": "san francisco" } }
      ]
    }
  }
}
```

---

### 3.4 Headcount, Revenue & Growth

| UI Field | PDL API Field | Type | Query Operator | Plan Required | Notes |
|----------|--------------|------|----------------|---------------|-------|
| Employee count | `employee_count` | Integer ≥ 0 | `range` | Standard | Min/max slider |
| Employee count (bucket) | `size` | Enum | `term` | Standard | Dropdown — see [Size Enums](#size-enums) |
| Annual revenue | `inferred_revenue` | Enum | `term` | Standard | PDL-estimated range — see [Revenue Enums](#revenue-enums) |
| Employee growth % | `employee_growth_rate.12_month` | Float | `range` | **Premium Insights** | 12-month growth rate as decimal e.g. `0.15` = 15% |

**ES DSL example:**
```json
{
  "query": {
    "bool": {
      "filter": [
        { "range": { "employee_count": { "gte": 100, "lte": 5000 } } },
        { "term": { "inferred_revenue": "$10M-$25M" } },
        { "range": { "employee_growth_rate.12_month": { "gte": 0.10 } } }
      ]
    }
  }
}
```

---

### 3.5 Founded, Funding & IPO

| UI Field | PDL API Field | Type | Query Operator | Notes |
|----------|--------------|------|----------------|-------|
| Year founded | `founded` | Integer > 0 | `range` | e.g. `{"gte": 2010, "lte": 2020}` |
| Last funding round | `latest_funding_stage` | Enum | `term` | See [Funding Round Enums](#funding-round-enums) |
| Total funding raised (min) | `total_funding_raised` | Float > 0 | `range` | USD value e.g. `{"gte": 1000000}` |
| Most recent funding after | `last_funding_date` | Date (YYYY-MM-DD) | `range` | e.g. `{"gte": "2023-01-01"}` |

**ES DSL example:**
```json
{
  "query": {
    "bool": {
      "filter": [
        { "range": { "founded": { "gte": 2015 } } },
        { "term": { "latest_funding_stage": "series_b" } },
        { "range": { "total_funding_raised": { "gte": 5000000 } } },
        { "range": { "last_funding_date": { "gte": "2022-01-01" } } }
      ]
    }
  }
}
```

---

### 3.6 Role Mix & Hiring Growth

| UI Field | PDL API Field | Type | Query Operator | Plan Required | Notes |
|----------|--------------|------|----------------|---------------|-------|
| Role composition (count by role) | `employee_count_by_role.{role}` | Object | `range` | **Premium Insights** | e.g. `employee_count_by_role.engineering >= 50` |
| Role growth (12-month by role) | `employee_growth_rate_12_month_by_role.{role}` | Object | `range` | **Premium Insights** | Growth rate per role |

> **Role names** use the 25 canonical role values: `engineering`, `sales`, `marketing`, `product`, `finance`, `human_resources`, `operations`, `legal`, `research`, etc.

**ES DSL example:**
```json
{
  "query": {
    "bool": {
      "filter": [
        { "range": { "employee_count_by_role.engineering": { "gte": 50 } } },
        { "range": { "employee_growth_rate_12_month_by_role.sales": { "gte": 0.05 } } }
      ]
    }
  }
}
```

---

## 4. Not Implementable / Limitations

| UI Field | Issue | Workaround / Alternative |
|----------|-------|--------------------------|
| **"Most employees in" (Company HQ section)** | `employee_count_by_country` returns a nested object `{"us": 500, "gb": 100}`. PDL does not expose dot-notation querying like `employee_count_by_country.us >= 100` in the search API | Filter by HQ `location.country` instead — this gives you companies headquartered in a country, which is a practical proxy |
| **Past company filtering (isolated)** | Experience array is flattened. Cannot query "was VP **at Google specifically**" — can only query VP and Google independently | Acceptable for most use cases. If exact co-occurrence needed, post-filter in your own code after fetching results |
| **Skills — canonical matching** | `skills` are **self-reported strings**, not canonical enums. `"Python"`, `"python"`, `"python3"` may all appear | Use `term` (exact lowercase) or `match` (relevance), but expect some misses. No canonical skill taxonomy in PDL |
| **Languages — proficiency filter** | `languages` has a `proficiency` field (1–5 scale) but querying `languages.proficiency >= 3` alongside `languages.name = "english"` suffers from the same flattened-array cross-field issue as experience | Filter only by `languages.name`; skip proficiency filtering |
| **Certifications — organization filter** | Same flattened-array issue — cannot guarantee cert name + issuing org are from the same certification entry | Filter only by `certifications.name` |
| **Employee growth % (Company)** | `employee_growth_rate` fields require **Premium Insights** plan — not available on standard API plan | Confirm plan tier with PDL before building this filter |
| **Role composition rules (Company)** | `employee_count_by_role` also requires **Premium Insights** plan | Confirm plan tier. Field names are `employee_count_by_role.{role_name}` |
| **Stock exchange — MIC codes** | PDL uses MIC (Market Identifier Code) format (`"XNAS"`, `"XNYS"`) — not human-readable names | Map common exchanges in your UI: NYSE→`XNYS`, NASDAQ→`XNAS`, LSE→`XLON`, etc. Full list: ISO 10383 |
| **LinkedIn connections exact value** | PDL caps `linkedin_connections` display at 500 — anyone with 500+ shows as 500 | Use `range gte 500` for "500+ connections" bucket |

---

## 5. Enum Reference

### Level Enums
`job_title_levels` / `experience.title.levels`

| Value | Description |
|-------|-------------|
| `cxo` | C-suite (CEO, CTO, CFO, etc.) |
| `vp` | Vice President |
| `director` | Director |
| `manager` | Manager |
| `senior` | Senior individual contributor |
| `entry` | Entry-level |
| `owner` | Business owner |
| `partner` | Partner |
| `training` | Trainee / apprentice |
| `unpaid` | Volunteer / intern (unpaid) |

### Role Enums
`job_title_role` / `experience.title.role`

`advisory`, `analyst`, `creative`, `education`, `engineering`, `finance`, `fulfillment`, `health`, `hospitality`, `human_resources`, `legal`, `manufacturing`, `marketing`, `operations`, `partnerships`, `product`, `professional_service`, `public_service`, `research`, `sales`, `sales_engineering`, `support`, `trade`, `unemployed`

### Size Enums
`job_company_size` (person) / `size` (company)

`1-10`, `11-50`, `51-200`, `201-500`, `501-1000`, `1001-5000`, `5001-10000`, `10001+`

### Company Type Enums
`job_company_type` / `type`

`private`, `public`, `nonprofit`, `government`, `educational`, `public_subsidiary`

### Revenue Enums
`inferred_revenue` (company) / `job_company_inferred_revenue` (person)

`$0-$1M`, `$1M-$10M`, `$10M-$25M`, `$25M-$50M`, `$50M-$100M`, `$100M-$250M`, `$250M-$500M`, `$500M-$1B`, `$1B-$10B`, `$10B+`

### Funding Round Enums
`latest_funding_stage` / `funding_stages`

`angel`, `pre_seed`, `seed`, `series_a`, `series_b`, `series_c`, `series_d`, `series_e`, `series_f`, `series_g`, `series_h`, `series_i`, `series_j`, `series_unknown`, `convertible_note`, `corporate_round`, `debt_financing`, `equity_crowdfunding`, `grant`, `initial_coin_offering`, `private_equity`, `post_ipo_debt`, `post_ipo_equity`, `post_ipo_secondary`, `funding_round`, `non_equity_assistance`, `product_crowdfunding`, `secondary_market`, `undisclosed`

### Industry Enums (Sample — 148 total)
`job_company_industry` / `industry`

`accounting`, `airlines/aviation`, `automotive`, `banking`, `biotechnology`, `broadcast media`, `capital markets`, `chemicals`, `civil engineering`, `commercial real estate`, `computer & network security`, `computer games`, `computer hardware`, `computer networking`, `computer software`, `construction`, `consumer electronics`, `consumer goods`, `defense & space`, `e-learning`, `education management`, `electrical/electronic manufacturing`, `entertainment`, `environmental services`, `financial services`, `food & beverages`, `government administration`, `health, wellness and fitness`, `higher education`, `hospital & health care`, `hospitality`, `human resources`, `information technology and services`, `insurance`, `internet`, `investment banking`, `investment management`, `law practice`, `legal services`, `logistics and supply chain`, `management consulting`, `marketing and advertising`, `media production`, `medical devices`, `medical practice`, `mining & metals`, `non-profit organization management`, `oil & energy`, `pharmaceuticals`, `public relations and communications`, `real estate`, `research`, `retail`, `semiconductors`, `staffing and recruiting`, `telecommunications`, `transportation/trucking/railroad`, `venture capital & private equity`, `wholesale` *(and ~90 more)*

### Degree Enums (Sample)
`education.degrees`

`associate of arts`, `associate of science`, `bachelor of arts`, `bachelor of science`, `bachelor of engineering`, `bachelor of business administration`, `master of arts`, `master of science`, `master of business administration`, `master of engineering`, `doctor of philosophy`, `doctor of medicine`, `juris doctor`

---

## 6. Example Queries

### Full Person Search (Combined)
```json
POST /v5/person/search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "job_title": "software engineer" } }
      ],
      "filter": [
        { "term":  { "location_country": "united states" } },
        { "term":  { "location_region": "california" } },
        { "term":  { "job_title_levels": "senior" } },
        { "term":  { "job_title_role": "engineering" } },
        { "term":  { "job_company_industry": "computer software" } },
        { "term":  { "job_company_size": "1001-5000" } },
        { "term":  { "skills": "python" } },
        { "range": { "inferred_years_experience": { "gte": 5 } } }
      ]
    }
  },
  "size": 25,
  "from": 0
}
```

### Full Company Search (Combined)
```json
POST /v5/company/search
{
  "query": {
    "bool": {
      "filter": [
        { "term":  { "industry": "computer software" } },
        { "term":  { "type": "private" } },
        { "term":  { "location.country": "united states" } },
        { "term":  { "location.region": "california" } },
        { "range": { "employee_count": { "gte": 50, "lte": 500 } } },
        { "term":  { "inferred_revenue": "$10M-$25M" } },
        { "range": { "founded": { "gte": 2015 } } },
        { "term":  { "latest_funding_stage": "series_b" } },
        { "range": { "total_funding_raised": { "gte": 5000000 } } },
        { "range": { "last_funding_date": { "gte": "2022-01-01" } } }
      ]
    }
  },
  "size": 25,
  "from": 0
}
```

### Multi-Value OR with `should`
```json
{
  "query": {
    "bool": {
      "should": [
        { "term": { "job_title_levels": "vp" } },
        { "term": { "job_title_levels": "cxo" } },
        { "term": { "job_title_levels": "director" } }
      ],
      "minimum_should_match": 1
    }
  }
}
```

### Wildcard / Partial Text
```json
{
  "query": {
    "wildcard": { "job_title": "*engineer*" }
  }
}
```

### Field Exists Check
```json
{
  "query": {
    "exists": { "field": "linkedin_url" }
  }
}
```

### Equivalent SQL (simple flat query only)
```sql
SELECT * FROM person
WHERE job_title LIKE '%software engineer%'
  AND location_country = 'united states'
  AND job_title_levels = 'senior'
  AND inferred_years_experience >= 5
  AND job_company_size = '1001-5000'
LIMIT 25;
```

---

## Summary Table — All Fields

### Person Search

| # | UI Section | UI Field | API Field | Implementable | Query Type |
|---|-----------|----------|-----------|---------------|------------|
| 1 | Name & LinkedIn | First name | `first_name` | ✅ Yes | `match` |
| 2 | Name & LinkedIn | Last name | `last_name` | ✅ Yes | `match` |
| 3 | Name & LinkedIn | LinkedIn URL | `linkedin_url` | ✅ Yes | `term` |
| 4 | Profile details | Headline contains | `headline` | ✅ Yes | `match` |
| 5 | Profile details | Summary contains | `summary` | ✅ Yes | `match` |
| 6 | Profile details | Twitter handle | `twitter_username` | ✅ Yes | `term` |
| 7 | Profile details | Languages | `languages.name` | ✅ Yes | `term` |
| 8 | Profile details | Skills | `skills` | ✅ Yes | `term` |
| 9 | Profile details | Certifications | `certifications.name` | ✅ Yes | `match` |
| 10 | Profile details | Degree | `education.degrees` | ✅ Yes | `term` (enum) |
| 11 | Profile details | School | `education.school.name` | ✅ Yes | `match` |
| 12 | Profile details | Field of study | `education.majors` | ✅ Yes | `term` (enum) |
| 13 | Profile details | LinkedIn connections | `linkedin_connections` | ✅ Yes | `range` |
| 14 | Title & seniority | Job title | `job_title` | ✅ Yes | `match` / `wildcard` |
| 15 | Title & seniority | Seniority | `job_title_levels` | ✅ Yes | `term` (enum) |
| 16 | Title & seniority | Function | `job_title_role` | ✅ Yes | `term` (enum) |
| 17 | Title & seniority | Total years experience | `inferred_years_experience` | ✅ Yes | `range` |
| 18 | Current company | Company name | `job_company_name` | ✅ Yes | `match` |
| 19 | Current company | Company LinkedIn URL | `job_company_linkedin_url` | ✅ Yes | `term` |
| 20 | Current company | Company domain | `job_company_website` | ✅ Yes | `term` |
| 21 | Current company | Industry | `job_company_industry` | ✅ Yes | `term` (enum) |
| 22 | Current company | Company headcount | `job_company_size` / `job_company_employee_count` | ✅ Yes | `term` / `range` |
| 23 | Past roles | Past companies | `experience.company.name` | ⚠️ Partial | `match` (cross-field caveat) |
| 24 | Past roles | Past titles | `experience.title.name` | ⚠️ Partial | `match` (cross-field caveat) |
| 25 | Past roles | Past seniority | `experience.title.levels` | ⚠️ Partial | `term` (cross-field caveat) |
| 26 | Past roles | Past function | `experience.title.role` | ⚠️ Partial | `term` (cross-field caveat) |
| 27 | Person location | Country / region | `location_country` | ✅ Yes | `term` |
| 28 | Person location | State / province | `location_region` | ✅ Yes | `term` |
| 29 | Person location | City | `location_locality` | ✅ Yes | `term` |
| 30 | Company HQ location | HQ country | `job_company_location_country` | ✅ Yes | `term` |
| 31 | Company HQ location | HQ state | `job_company_location_region` | ✅ Yes | `term` |
| 32 | Company HQ location | HQ city | `job_company_location_locality` | ✅ Yes | `term` |

### Company Search

| # | UI Section | UI Field | API Field | Implementable | Query Type |
|---|-----------|----------|-----------|---------------|------------|
| 1 | Name & domain | Company name | `name` | ✅ Yes | `match` |
| 2 | Name & domain | Website domain | `website` | ✅ Yes | `term` |
| 3 | Industry & Type | Industry | `industry` | ✅ Yes | `term` (enum) |
| 4 | Industry & Type | Type | `type` | ✅ Yes | `term` (enum) |
| 5 | Industry & Type | Stock exchange | `mic_exchange` | ✅ Yes | `term` (MIC code) |
| 6 | HQ location | HQ country | `location.country` | ✅ Yes | `term` |
| 7 | HQ location | HQ state | `location.region` | ✅ Yes | `term` |
| 8 | HQ location | HQ city | `location.locality` | ✅ Yes | `term` |
| 9 | HQ location | Most employees in | `employee_count_by_country` | ❌ Not directly | Use `location.country` as proxy |
| 10 | Headcount etc. | Employee count | `employee_count` / `size` | ✅ Yes | `range` / `term` |
| 11 | Headcount etc. | Annual revenue | `inferred_revenue` | ✅ Yes | `term` (enum) |
| 12 | Headcount etc. | Employee growth % | `employee_growth_rate.12_month` | ⚠️ Premium | `range` |
| 13 | Founded etc. | Year founded | `founded` | ✅ Yes | `range` |
| 14 | Founded etc. | Last funding round | `latest_funding_stage` | ✅ Yes | `term` (enum) |
| 15 | Founded etc. | Total funding raised (min) | `total_funding_raised` | ✅ Yes | `range` |
| 16 | Founded etc. | Most recent funding after | `last_funding_date` | ✅ Yes | `range` (date) |
| 17 | Role mix | Role composition rules | `employee_count_by_role.{role}` | ⚠️ Premium | `range` |

**Legend:** ✅ Fully implementable | ⚠️ Implementable with caveat / Premium plan | ❌ Not directly implementable
