# Cursor Rules System — Flowcharts

Detailed diagrams showing how rules, modes, skills, and MCP tools interact.

---

## 1. Complete System Overview

```mermaid
flowchart TB
    subgraph USER["👤 USER INPUT"]
        TRIGGER[Trigger keyword<br/>"init", "ask", "plan", etc.]
    end

    subgraph RULES["📜 ALWAYS-APPLIED RULES"]
        HR[Hard Rules]
        SHARED[Shared Vocabulary]
        COMM[Communication Standards]
        MCP_CFG[MCP Configuration]
    end

    subgraph MODE_DISPATCH["🔀 MODE DISPATCHER"]
        DETECT{Detect<br/>trigger}
        READ[Read mode file<br/>from modes/]
    end

    subgraph MODES["🔄 MODE EXECUTION"]
        INIT[Init Mode]
        ASK[Ask Mode]
        PLAN[Plan Mode]
        AGENT[Agent Mode]
        COMMIT_M[Commit Mode]
        PR[Push-PR Mode]
    end

    subgraph SKILLS["🛠️ SKILL INVOCATION"]
        SKILL_READ[Read SKILL.md]
        SKILL_EXEC[Execute phases]
        SKILL_OUT[Return output]
    end

    subgraph MCP["🔌 MCP TOOLS"]
        NOTION[Notion]
        BROWSER[Browser]
        CTX7[Context7]
    end

    subgraph GATES["🚦 GATES"]
        G1[Gate 1]
        G2[Gate 2]
        G3[Gate 3]
        G4[Gate 4]
    end

    USER --> RULES
    RULES --> MODE_DISPATCH
    DETECT --> READ
    READ --> MODES
    
    MODES -.->|invoke skill| SKILLS
    SKILLS -.->|use MCP| MCP
    SKILLS -.->|return| MODES
    
    MODES --> GATES
    GATES -->|OK| MODES
    GATES -->|KO| USER
```

---

## 2. Mode Transition Flow

```mermaid
stateDiagram-v2
    [*] --> Init: "init", "start feature"
    
    Init --> Ask: User confirms
    Init --> Init: Resume PR flow
    
    Ask --> Ask: DIG (refine wireframes)
    Ask --> Plan: Gate 1 & 2 OK
    Ask --> [*]: All KO (stop)
    
    Plan --> Plan: Gate 3 (tech decision)
    Plan --> Agent: Appetite confirmed
    
    Agent --> Commit: Per commit
    Commit --> Agent: Continue
    Commit --> Debug: RED verdict
    Debug --> Commit: Fixed
    
    Agent --> PushPR: Threshold crossed
    PushPR --> [*]: Gate 4 (PR merged)
    PushPR --> Agent: Changes requested
```

---

## 3. Ask Mode (Value Analysis) — Detailed

```mermaid
flowchart TB
    subgraph PHASE1["PHASE 1: DIVERGE"]
        direction TB
        
        subgraph SILENT1["Silent Analysis"]
            PF[problem-framing skill]
            CS[competitor-scan skill]
            DC[design-context skill]
        end
        
        EXEC1[Executive Summary]
        FLOW[User Journey Flowchart]
        WIRE[Dream Wireframes<br/>ALL ideas, go bold]
        
        PF --> CS --> DC
        DC --> EXEC1
        EXEC1 --> FLOW
        FLOW --> WIRE
    end
    
    G1{GATE 1<br/>Per wireframe:<br/>OK / KO / DIG}
    
    subgraph PHASE2["PHASE 2: CONVERGE"]
        direction TB
        
        subgraph SILENT2["Silent Skills"]
            SM[state-machine skill]
            QAP[qa-planning skill]
            DM[dependency-mapping skill]
            GTM[gtm-alignment skill]
            PH[phasing skill]
        end
        
        QAC[QA Contract<br/>G#1-N, AC#1-N]
        TIMELINE[ASCII Timeline]
        EXEC2[Executive Summary]
        
        SM --> QAP --> DM --> GTM --> PH
        PH --> QAC
        QAC --> TIMELINE
        TIMELINE --> EXEC2
    end
    
    G2{GATE 2<br/>OK / REORDER /<br/>SPLIT / MERGE}
    
    WIRE --> G1
    G1 -->|All OK| PHASE2
    G1 -->|DIG| WIRE
    G1 -->|KO| DEC[decision-capture]
    DEC --> WIRE
    
    EXEC2 --> G2
    G2 -->|OK| PLAN_MODE[Plan Mode]
    G2 -->|Adjust| PHASE2
```

---

## 4. Plan Mode (Value Engineering) — Detailed

```mermaid
flowchart TB
    subgraph INPUT["Input from Ask Mode"]
        QAC[QA Contract<br/>G#1-N, AC#1-N]
        SCOPE[Validated Scope]
        PHASES[Approved Phasing]
    end
    
    subgraph APPETITE["Phase 1: APPETITE"]
        FLEX[Scope Flexibility]
        RISK[Risk Tolerance]
        BUDGET[Token/Cost Estimates]
    end
    
    subgraph REUSE["Phase 2: REUSE INVENTORY"]
        SEARCH[Search Codebase<br/>components/, hooks/, services/]
        DOC[Document Reusable Assets]
        VALIDATE[Validate Reuse Justification]
    end
    
    subgraph TECH["Phase 3: TECHNICAL DIVERGE"]
        TD[tech-divergence skill]
        SCORE{Score?}
        OPTS[Options Matrix]
    end
    
    G3{GATE 3<br/>A / B / C}
    
    subgraph COMMITS["Phase 4: COMMIT PLAN"]
        DEF[Define Commits]
        SAT[Map Satisfies<br/>G#X, AC#Y]
        ORDER[Order by Dependencies]
    end
    
    subgraph THRESHOLD["Phase 5: THRESHOLD"]
        PROJ[Project PR Trigger]
        PREDICT[Identify PR Scope]
    end
    
    INPUT --> APPETITE
    APPETITE --> REUSE
    REUSE --> TECH
    
    TD --> SCORE
    SCORE -->|0-3| COMMITS
    SCORE -->|4-8| OPTS
    OPTS --> G3
    G3 -->|Selected| COMMITS
    G3 -->|KO| DEC[decision-capture]
    
    COMMITS --> THRESHOLD
    THRESHOLD --> AGENT[Agent Mode]
```

---

## 5. Agent Mode (Value Delivery) — Commit Loop

```mermaid
flowchart TB
    subgraph INPUT["Input from Plan Mode"]
        PLAN[Commit Plan]
        QAC[QA Contract]
    end
    
    subgraph COMMIT_LOOP["Per Commit"]
        IMPL[Implement Changes]
        
        subgraph PREREVIEW["pr-review skill"]
            LINT[ReadLints]
            TYPE[npm run typecheck]
            PASS1{Pass?}
        end
        
        subgraph QACOMMIT["qa-commit skill"]
            LOAD[Load Satisfies<br/>G#X, AC#Y]
            TECH[Technical Validation]
            GHERKIN[Gherkin Verification]
            AC[Acceptance Verification]
            VERDICT{Verdict?}
        end
        
        GIT[git commit]
        
        subgraph THRESHOLD["pr-threshold skill"]
            CHECK[Check Cumulative<br/>LOC, Files, Commits]
            TRIGGER{Threshold<br/>crossed?}
        end
    end
    
    subgraph DEBUG["debug skill"]
        OBSERVE[Observe Error]
        HYPO[Form Hypothesis]
        ISOLATE[Isolate Root Cause]
        FIX[Apply Fix]
        VERIFY[Verify Fix]
        HARDEN[Add Test]
    end
    
    INPUT --> IMPL
    IMPL --> LINT
    LINT --> TYPE
    TYPE --> PASS1
    
    PASS1 -->|No| FIX_LINT[Fix Issues]
    FIX_LINT --> LINT
    
    PASS1 -->|Yes| LOAD
    LOAD --> TECH --> GHERKIN --> AC --> VERDICT
    
    VERDICT -->|GREEN| GIT
    VERDICT -->|RED| DEBUG
    
    DEBUG --> QACOMMIT
    
    GIT --> CHECK
    CHECK --> TRIGGER
    
    TRIGGER -->|No| NEXT[Next Commit]
    NEXT --> IMPL
    
    TRIGGER -->|Yes| PR[Push-PR Mode]
```

---

## 6. Skill Invocation Pattern

```mermaid
flowchart LR
    subgraph TRIGGERS["Trigger Sources"]
        USER[User: "use X skill"]
        MODE[Mode auto-invoke]
        SKILL[Skill chaining]
    end
    
    subgraph EXECUTION["Skill Execution"]
        READ[Read skills/X/SKILL.md]
        PHASES[Execute phases in order]
        MCP[Use MCP tools if needed]
        OUTPUT[Generate output]
    end
    
    subgraph MODES["Mode Types"]
        SILENT[Silent<br/>No output until complete]
        VISIBLE[Visible<br/>Show intermediate output]
    end
    
    TRIGGERS --> READ
    READ --> PHASES
    PHASES <-.-> MCP
    PHASES --> OUTPUT
    
    OUTPUT --> SILENT
    OUTPUT --> VISIBLE
```

---

## 7. MCP Integration Map

```mermaid
flowchart TB
    subgraph SKILLS["Skills"]
        PF[problem-framing]
        CS[competitor-scan]
        DC[design-context]
        TD[tech-divergence]
        QAC[qa-commit]
        DBG[debug]
        NS[notion-sync]
    end
    
    subgraph NOTION["Notion MCP"]
        PAGES[API-retrieve-a-page]
        PATCH[API-patch-page]
        SEARCH[API-post-search]
        BLOCKS[API-get-block-children]
    end
    
    subgraph BROWSER["Browser MCP"]
        NAV[browser_navigate]
        SNAP[browser_snapshot]
        CLICK[browser_click]
        SHOT[browser_take_screenshot]
    end
    
    subgraph CTX7["Context7 MCP"]
        RESOLVE[resolve-library-id]
        DOCS[get-library-docs]
    end
    
    PF -.-> PAGES & BLOCKS
    CS -.-> NAV & SNAP & SHOT
    DC -.-> RESOLVE & DOCS
    TD -.-> DOCS & SEARCH
    QAC -.-> NAV & SNAP
    DBG -.-> NAV & SNAP & DOCS
    NS -.-> PATCH & BLOCKS
```

---

## 8. QA Contract Flow

```mermaid
flowchart LR
    subgraph ASK["Ask Mode"]
        QAP[qa-planning skill]
        GEN[Generate Contract]
    end
    
    subgraph CONTRACT["QA Contract"]
        G[G#1-N<br/>Gherkin Scenarios]
        AC[AC#1-N<br/>Acceptance Criteria]
    end
    
    subgraph PLAN["Plan Mode"]
        COMMIT[Define Commits]
        SAT[Satisfies: G#X, AC#Y]
    end
    
    subgraph AGENT["Agent Mode"]
        IMPL[Implement]
        VERIFY[qa-commit skill]
        CHECK[Verify G#X, AC#Y]
    end
    
    QAP --> GEN
    GEN --> G & AC
    G & AC --> COMMIT
    COMMIT --> SAT
    SAT --> IMPL
    IMPL --> VERIFY
    VERIFY --> CHECK
    CHECK -.->|Reference| G & AC
```

---

## 9. Gate Decision Points

```mermaid
flowchart TB
    subgraph G1["Gate 1: Wireframe Approval"]
        W[Per wireframe]
        W --> OK1[OK: Validated]
        W --> KO1[KO: Rejected]
        W --> DIG1[DIG: Refine]
        KO1 --> DEC1[decision-capture]
    end
    
    subgraph G2["Gate 2: Phasing Approval"]
        P[Proposed timeline]
        P --> OK2[OK: Proceed]
        P --> REORDER[REORDER]
        P --> SPLIT[SPLIT]
        P --> MERGE[MERGE]
        P --> BLOCK[BLOCK]
        BLOCK --> DEC2[decision-capture]
    end
    
    subgraph G3["Gate 3: Technical Approach"]
        T[Score ≥ 4]
        T --> A[Option A]
        T --> B[Option B]
        T --> C[Option C]
        A & B & C --> DEC3[decision-capture<br/>if rejected]
    end
    
    subgraph G4["Gate 4: PR Review"]
        PR[Pull Request]
        PR --> APPROVE[Approve]
        PR --> CHANGES[Request Changes]
        CHANGES --> AGENT[Back to Agent]
    end
    
    G1 -->|All OK| G2
    G2 -->|OK| G3
    G3 -->|Selected| G4
```

---

## 10. Session Tracking (TPS Metrics)

```mermaid
flowchart LR
    subgraph METRICS["Tracked Metrics"]
        TAKT[Takt Time<br/>Target per phase]
        LOOP[Loop Count<br/>L1, L2, L3...]
        MUDA[Muda<br/>Rework, waiting]
    end
    
    subgraph DISPLAY["Session Header/Footer"]
        HEAD["[STATUS] | Feature | PHASE | L[N] | X/Y | TIME"]
        FOOT["Next: [action]"]
    end
    
    subgraph THRESHOLDS["Thresholds"]
        WARN[Warning<br/>Display !]
        STOP[Stop<br/>Force close]
    end
    
    METRICS --> DISPLAY
    TAKT --> WARN --> STOP
```

---

## Quick Reference Table

| Diagram | Shows |
|---------|-------|
| 1. System Overview | All layers and connections |
| 2. Mode Transition | State machine of modes |
| 3. Ask Mode | Diverge/Converge phases |
| 4. Plan Mode | 5 engineering phases |
| 5. Agent Mode | Commit loop with debug |
| 6. Skill Invocation | How skills are triggered |
| 7. MCP Integration | Which skills use which MCP |
| 8. QA Contract | Lifecycle of G#N/AC#N |
| 9. Gate Decisions | Human checkpoints |
| 10. Session Tracking | TPS metrics display |
