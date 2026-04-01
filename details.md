# GeneSage — Project Details

---

## 1. Problem Statement

Genetic testing has become a cornerstone of modern healthcare, particularly in oncology, rare disease diagnosis, and pharmacogenomics. However, **10–40% of patients** undergoing clinical genetic testing receive results classified as **Variants of Uncertain Significance (VUS)** — mutations in their DNA whose impact on health is unknown.

These VUS results are **non-actionable**: clinicians cannot use them to guide treatment, adjust screening protocols, or provide definitive diagnoses. This creates a cascade of problems:

- **Diagnostic limbo** — Patients receive anxiety-inducing ambiguous results with no clear path forward.
- **Delayed or missed interventions** — Pathogenic variants misclassified as VUS may go untreated, while truly benign variants may trigger unnecessary medical procedures.
- **Disproportionate impact on underrepresented populations** — Due to historically biased genomic databases, VUS rates are significantly higher in non-European populations.
- **Resource burden** — Follow-up testing (family co-segregation studies, functional assays) is expensive, time-consuming, and often inaccessible.

The central challenge is this: **How can we rapidly and accurately predict whether a given genetic variant is likely to cause disease, without relying on slow, expensive experimental validation for each individual mutation?**

---

## 2. Abstract

**GeneSage** is a web-based genomic variant analysis platform that harnesses the power of **Evo2**, a state-of-the-art DNA foundation model developed by the Arc Institute, to predict the pathogenicity of single nucleotide variants (SNVs) in real time. The platform enables researchers and clinicians to search for any human gene, browse its DNA sequence, view known clinical variants from the ClinVar database, and run AI-powered variant effect predictions — all without requiring any local GPU infrastructure or computational biology expertise.

By computing the **delta log-likelihood score** between a reference and mutated DNA sequence using a model trained on 9.3 trillion nucleotides across all domains of life, GeneSage provides zero-shot pathogenicity predictions that achieve over **90% accuracy** on established benchmarks like the BRCA1 saturation mutagenesis dataset. The platform further enables side-by-side comparison of its AI predictions against existing ClinVar clinical classifications, helping validate AI reliability and identify potentially misclassified variants.

---

## 3. Aim

To build an accessible, end-to-end web platform that **democratizes AI-powered genomic variant analysis** — enabling anyone to predict the functional impact of DNA mutations using cutting-edge deep learning, without requiring computational biology infrastructure or specialized expertise.

---

## 4. Objectives

1. **Deploy the Evo2 7B model** as a scalable, GPU-accelerated inference endpoint using Modal serverless infrastructure on NVIDIA H100 GPUs.
2. **Build an interactive frontend** for gene exploration — allowing users to search genes, browse chromosomes, and visualize DNA sequences with nucleotide-level interactivity.
3. **Integrate multiple biomedical APIs** (UCSC Genome Browser, NCBI Gene, ClinVar) to provide rich genomic context alongside AI predictions.
4. **Implement single-variant analysis** — accept user-specified position and alternative nucleotide, fetch surrounding genomic context, score with Evo2, and classify as pathogenic or benign with a confidence metric.
5. **Enable ClinVar comparison** — automatically fetch known clinical variants for any gene and allow one-click Evo2 analysis to compare AI predictions against established clinical assessments.
6. **Calibrate the classification threshold** using the BRCA1 saturation mutagenesis benchmark (Findlay et al., 2018) to derive an optimal decision boundary for pathogenicity prediction.

---

## 5. The Underlying Model — Evo2

### 5.1 What is Evo2?

Evo2 is a **genomic foundation model** developed by the **Arc Institute** in collaboration with **NVIDIA** and academic partners, released in February 2025. It is a DNA language model that processes raw nucleotide sequences (A, T, G, C) at single-base resolution and can understand biological patterns across genes, regulatory regions, and entire genomes.

| Property | Details |
|---|---|
| **Developers** | Arc Institute, NVIDIA, UC Berkeley, Stanford, and others |
| **Architecture** | StripedHyena 2 (multi-hybrid, near-linear scaling) |
| **Parameters** | 7B and 40B variants |
| **Context length** | Up to **1 million base pairs** |
| **Training data** | OpenGenome2 — **9.3 trillion nucleotides** |
| **Training infrastructure** | 2,000+ NVIDIA H100 GPUs on DGX Cloud (AWS) |
| **Training framework** | Savanna (open-source) |
| **Paper** | Brixi et al., bioRxiv 2025.02.18.638918 |

### 5.2 Architecture: StripedHyena 2

Traditional Transformers have **quadratic scaling** with sequence length, making them impractical for genomic sequences that can span millions of base pairs. Evo2 uses the **StripedHyena 2** architecture — a multi-hybrid design combining:

- **State-space model (SSM) layers** for efficient long-range dependency modeling with near-linear compute scaling
- **Attention layers** interspersed for precise short-range pattern recognition
- **Gated convolution layers** for local feature extraction

This hybrid approach allows Evo2 to process sequences up to **1 million nucleotides** while maintaining single-nucleotide resolution — critical for detecting the impact of individual point mutations.

### 5.3 Training Dataset: OpenGenome2

Evo2 was trained on **OpenGenome2**, one of the largest genomic datasets ever assembled:

| Property | Details |
|---|---|
| **Total size** | 9.3 trillion nucleotides (8.8 trillion tokens) |
| **Organisms** | 128,000+ whole genomes across all three domains of life — Eukarya (humans, animals, plants), Bacteria, and Archaea |
| **Data sources** | Whole genomes, metagenomes, phage genomes |
| **Available at** | HuggingFace (`arcinstitute/opengenome2`) |

#### Two-Phase Training Strategy

1. **Phase 1 — Short-context pretraining (8,192 bp windows):**
   Data enriched for functional regions (gene bodies, promoters, enhancers). This teaches the model what "functional" DNA looks like at a local level.

2. **Phase 2 — Midtraining / Long-context extension (1M bp):**
   Shifted toward whole-genome samples to learn long-range genomic dependencies — how distant regulatory elements interact with genes, chromatin structure effects, etc.

### 5.4 Why Evo2?

We chose Evo2 for GeneSage because of several unique capabilities:

- **Zero-shot variant effect prediction** — Can classify variants as pathogenic/benign without ever being explicitly trained on clinical variant labels. It learned functional constraints purely from evolutionary patterns across 128,000 genomes.
- **Coding AND noncoding variant support** — Unlike many protein-centric models, Evo2 operates on raw DNA and can score regulatory/splice-site variants too.
- **>90% accuracy on BRCA1 benchmarks** — Validated against experimentally determined functional scores.
- **Open-source** — Model weights, training code, and dataset are all publicly available.

---

## 6. The Benchmark Dataset — BRCA1 Saturation Mutagenesis

To calibrate GeneSage's classification threshold, we use data from the landmark study:

> **Findlay, G. M., et al. (2018). "Accurate classification of BRCA1 variants with saturation genome editing." *Nature*, 562, 217–222.**

### About the Dataset

| Property | Details |
|---|---|
| **Gene** | BRCA1 (Breast Cancer type 1 susceptibility protein) |
| **Method** | Saturation Genome Editing (SGE) using CRISPR-Cas9 |
| **Scope** | 3,893 SNVs across 13 exons (96.5% of all possible SNVs in targeted regions) |
| **Targeted regions** | RING and BRCT domains (functionally critical) |
| **Cell line** | HAP1 (haploid human cells) |
| **Output** | Continuous function scores, bimodally distributed into **functional (FUNC)** and **loss-of-function (LOF)** classes |

This dataset provides ground-truth functional labels for thousands of BRCA1 variants, making it the gold standard for benchmarking variant effect prediction tools.

---

## 7. Our Approach & Methodology

### 7.1 High-Level Pipeline

```
User selects a gene or enters a variant
         │
         ▼
   ┌─────────────────────────┐
   │  Fetch reference genome  │ ◄── UCSC Genome Browser API
   │  sequence (8,192 bp      │
   │  window around variant)  │
   └──────────┬──────────────┘
              │
              ▼
   ┌─────────────────────────┐
   │  Create variant sequence │
   │  (substitute the SNV     │
   │   at the target position)│
   └──────────┬──────────────┘
              │
              ▼
   ┌─────────────────────────┐
   │  Score both sequences    │ ◄── Evo2 7B model (H100 GPU)
   │  with Evo2               │
   │  ref_score, var_score    │
   └──────────┬──────────────┘
              │
              ▼
   ┌─────────────────────────┐
   │  Compute delta score     │
   │  Δ = var_score - ref_score│
   └──────────┬──────────────┘
              │
              ▼
   ┌─────────────────────────┐
   │  Classify using          │
   │  calibrated threshold    │
   │  + compute confidence    │
   └──────────┬──────────────┘
              │
              ▼
   ┌─────────────────────────┐
   │  Return prediction:      │
   │  "Likely pathogenic" or  │
   │  "Likely benign"         │
   │  + confidence score      │
   └─────────────────────────┘
```

### 7.2 Step-by-Step Methodology

#### Step 1: Reference Sequence Retrieval

When a user submits a variant (e.g., chr17, position 43,119,628, alternative G):

- We fetch a **8,192 bp window** centered on the variant position from the **UCSC Genome Browser REST API**
- This window provides sufficient flanking context for Evo2 to understand the local genomic environment (promoters, exon–intron boundaries, regulatory motifs)
- API endpoint: `https://api.genome.ucsc.edu/getData/sequence`

#### Step 2: Variant Sequence Construction

- From the 8,192 bp reference window, we create a **variant sequence** by substituting the single nucleotide at the target position with the user-specified alternative allele
- Example: If reference has `...ATCGA...` at the variant position and the alternative is `T`, the variant sequence becomes `...ATCTA...`

#### Step 3: Evo2 Likelihood Scoring

Both sequences are scored using `model.score_sequences()`:

- **Reference score** = average log-likelihood that Evo2 assigns to the reference (wild-type) sequence
- **Variant score** = average log-likelihood that Evo2 assigns to the mutated sequence
- These scores reflect how "natural" or "expected" the model considers each sequence based on its training on 9.3 trillion nucleotides of evolutionary data

#### Step 4: Delta Score Calculation

```
delta_score = variant_score − reference_score
```

- **Negative delta** → The variant makes the sequence less likely (less "natural") → suggests loss of function → **potentially pathogenic**
- **Positive or near-zero delta** → The variant doesn't significantly disrupt sequence patterns → **likely benign**

#### Step 5: Threshold-Based Classification

We derived an optimal classification threshold from the BRCA1 benchmark dataset using **ROC analysis**:

```python
# ROC curve analysis on BRCA1 saturation mutagenesis data
fpr, tpr, thresholds = roc_curve(y_true, -delta_scores)
optimal_idx = (tpr - fpr).argmax()      # Youden's J statistic
optimal_threshold = -thresholds[optimal_idx]
```

**Calibrated parameters (derived from 500 BRCA1 variants):**

| Parameter | Value | Meaning |
|---|---|---|
| **Threshold** | −0.0009178519 | Decision boundary between pathogenic/benign |
| **LOF std. dev.** | 0.0015140239 | Standard deviation of delta scores for loss-of-function variants |
| **FUNC std. dev.** | 0.0009016589 | Standard deviation of delta scores for functional variants |

#### Step 6: Confidence Calculation

Confidence is computed as the **normalized distance** from the decision threshold, scaled by the standard deviation of the appropriate class:

```python
if delta_score < threshold:
    prediction = "Likely pathogenic"
    confidence = min(1.0, abs(delta_score - threshold) / lof_std)
else:
    prediction = "Likely benign"
    confidence = min(1.0, abs(delta_score - threshold) / func_std)
```

This means:
- A variant far below the threshold gets **high confidence** for pathogenic
- A variant close to the threshold gets **low confidence** (uncertain)
- Confidence is capped at 100%

---

## 8. System Architecture

### 8.1 Backend (Python + Modal)

| Component | Technology |
|---|---|
| **Runtime** | Modal (serverless GPU compute) |
| **GPU** | NVIDIA H100 |
| **Framework** | FastAPI (auto-generated by Modal) |
| **Model** | Evo2 7B (`evo2_7b`) via the `evo2` Python package |
| **Docker base** | `nvcr.io/nvidia/pytorch:25.04-py3` |
| **Model caching** | Modal Volume (`hf_cache`) mounted at `/root/.cache/huggingface` |
| **Concurrency** | `max_containers=1` (warm GPU singleton) |
| **Scale policy** | `scaledown_window=120` (keeps GPU warm for 2 minutes between requests) |

The model is loaded **once** when the container starts (`@modal.enter()`) and reused across all incoming requests. The API is exposed as a Modal FastAPI endpoint that accepts POST requests with the variant details.

### 8.2 Frontend (Next.js / T3 Stack)

| Component | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | TypeScript |
| **UI library** | React 19 |
| **Styling** | Tailwind CSS 4 |
| **UI components** | shadcn/ui (Radix UI primitives) |
| **Icons** | Lucide React |
| **Environment** | @t3-oss/env-nextjs (type-safe env vars) |

### 8.3 External APIs

| API | Provider | Usage in GeneSage |
|---|---|---|
| UCSC Genome Browser API | UC Santa Cruz | Genome assemblies, chromosome lists, DNA sequence retrieval |
| NCBI Clinical Tables API | NIH | Gene search by symbol/name |
| NCBI E-utilities (esummary) | NIH | Gene details (bounds, strand, summary) |
| NCBI E-utilities (ClinVar) | NIH | Known clinical variants for a gene |

### 8.4 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     USER (Browser)                       │
└──────────────┬──────────────────────────┬───────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────┐    ┌──────────────────────────┐
│   Next.js Frontend   │    │     Modal Backend         │
│   (Vercel/Local)     │    │   (Serverless H100 GPU)   │
│                      │    │                           │
│  • Gene search       │    │  • Load Evo2 7B model     │
│  • Sequence viewer   │    │  • Fetch ref sequence     │
│  • ClinVar browser   │───▶│  • Score ref + variant    │
│  • Variant form      │◀───│  • Classify + confidence  │
│  • Comparison modal  │    │                           │
└───────┬──────────────┘    └───────────┬───────────────┘
        │                               │
        ▼                               ▼
┌──────────────────────┐    ┌──────────────────────────┐
│   UCSC Genome API    │    │   UCSC Genome API         │
│   NCBI Gene API      │    │   (for ref sequences)     │
│   NCBI ClinVar API   │    │                           │
└──────────────────────┘    └──────────────────────────┘
```

---

## 9. Frontend Components & User Flow

### 9.1 Component Hierarchy

```
page.tsx (Home)
  ├── Genome Assembly Selector (UCSC genomes)
  ├── Browse Tabs
  │     ├── Search Genes (NCBI search)
  │     └── Browse Chromosomes (chromosome picker)
  └── GeneViewer (activated on gene selection)
        ├── VariantAnalysis (Evo2 analysis form + results)
        ├── KnownVariants (ClinVar table + per-variant Evo2 analysis)
        ├── GeneSequence (interactive DNA viewer with range slider)
        ├── GeneInformation (gene metadata card)
        └── VariantComparisonModal (ClinVar vs. Evo2 side-by-side)
```

### 9.2 User Flow

1. **Select genome assembly** → defaults to `hg38` (GRCh38, latest human reference)
2. **Search a gene** (e.g., "BRCA1") or **browse by chromosome**
3. **Click a gene** → opens GeneViewer, which:
   - Fetches gene position, metadata, and summary from NCBI
   - Loads the first 10,000 bp of the gene's DNA sequence from UCSC
   - Fetches up to 20 known ClinVar variants for this gene
4. **Analyze a variant** either by:
   - Manually entering a position + alternative nucleotide and clicking "Analyze"
   - Clicking a nucleotide in the sequence viewer to auto-fill position
   - Clicking "Analyze with Evo2" on any known ClinVar SNV
5. **View results** — prediction, delta score, confidence bar
6. **Compare** — For ClinVar variants, open the comparison modal to see ClinVar classification alongside Evo2 prediction, with an agreement/disagreement indicator


---

## 10. What We Built vs. What Existed

### What Already Existed (Evo2 / Arc Institute)

- The Evo2 model itself (architecture, weights, training)
- The OpenGenome2 training dataset
- A Jupyter notebook demonstrating BRCA1 batch analysis
- The `score_sequences()` API

### What We Built (GeneSage)

| Our Contribution | Details |
|---|---|
| **Real-time single-variant API** | Converted Evo2 from a batch notebook into a production FastAPI endpoint with GPU-warm singleton pattern |
| **Dynamic reference sequence fetching** | Instead of pre-downloaded genome files, we fetch sequences on-demand from the UCSC API for **any gene on any chromosome** |
| **Threshold calibration pipeline** | Ran the BRCA1 benchmark (500 variants), computed ROC curves, and derived the optimal decision boundary using Youden's J statistic |
| **Confidence scoring system** | Designed a distance-from-threshold metric normalized by class standard deviation |
| **Interactive web platform** | Full Next.js application with gene search, chromosome browsing, interactive DNA sequence viewer with color-coded nucleotides and position tracking |
| **ClinVar integration** | Automated fetching and display of known clinical variants with one-click AI analysis |
| **ClinVar vs. Evo2 comparison** | Side-by-side comparison modal to validate AI predictions against established clinical classifications |
| **Serverless GPU deployment** | Modal-based deployment that loads the model once and keeps it warm, enabling sub-second re-inference |

---

## 11. Real-World Impact & Applications

### 11.1 The Problem We're Solving

Every year, millions of genetic tests are ordered worldwide. A substantial fraction return VUS results — variants that current databases and methods cannot confidently classify. This creates:

- **Clinical uncertainty** for cancer risk assessment (e.g., BRCA1/2 variants and breast/ovarian cancer)
- **Treatment delays** for patients with rare diseases awaiting diagnosis
- **Health equity gaps** as underrepresented populations face disproportionately high VUS rates

### 11.2 How GeneSage Helps

1. **Rapid triage of VUS** — Instead of waiting years for population data to accumulate, clinicians can get an immediate AI-powered prediction of a variant's likely impact.

2. **Accessible to non-specialists** — No command line, no GPU setup, no coding required. A clinician or genetic counselor can search a gene and analyze a variant in under a minute.

3. **Validation against existing knowledge** — By comparing Evo2 predictions to ClinVar classifications for known variants, users can build confidence in the AI's reliability before applying it to novel variants.

4. **Scalable infrastructure** — The serverless GPU backend scales from zero to active in seconds and can serve multiple research teams without dedicated hardware.

### 11.3 Potential Use Cases

- **Clinical genetics labs** triaging VUS results before expensive functional follow-up
- **Research institutions** screening candidate variants for functional studies
- **Genetic counselors** providing patients with additional AI-generated evidence alongside standard results
- **Pharmaceutical companies** evaluating variant impacts during drug target validation
- **Educational settings** teaching genomics and AI-powered bioinformatics

---

## 12. Technical Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| AI Model | Evo2 7B (StripedHyena 2) | DNA sequence scoring and variant effect prediction |
| Backend Runtime | Modal | Serverless GPU compute (H100) |
| Backend Framework | FastAPI | REST API endpoint |
| Frontend Framework | Next.js 15 (T3 Stack) | React-based web application |
| UI Components | shadcn/ui + Radix UI | Accessible, composable UI primitives |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Language | Python (backend), TypeScript (frontend) | |
| Genomic Data | UCSC Genome Browser API | Reference sequences, genome assemblies |
| Clinical Data | NCBI E-utilities, ClinVar | Gene metadata, known clinical variants |
| Model Hosting | HuggingFace | Model weight distribution and caching |

---

## 13. Key Calculations Reference

### Delta Likelihood Score
```
Δ_score = score(variant_sequence) − score(reference_sequence)
```
Where `score()` is the mean log-likelihood assigned by Evo2 across all positions in the sequence.

### Classification Rule
```
IF Δ_score < −0.0009178519  →  "Likely pathogenic"
IF Δ_score ≥ −0.0009178519  →  "Likely benign"
```

### Confidence Score
```
confidence = min(1.0, |Δ_score − threshold| / σ_class)

where σ_class = {
    0.0015140239  if prediction = pathogenic   (LOF std dev)
    0.0009016589  if prediction = benign       (FUNC std dev)
}
```

### BRCA1 Benchmark Performance
- **AUROC**: Computed from 500 BRCA1 variants scored by Evo2 against functional labels from Findlay et al. (2018)
- **Threshold derivation**: Youden's J statistic (maximizes TPR − FPR)
- **Benchmark accuracy**: >90% (as reported by Arc Institute)

---

## 14. Limitations & Future Considerations

1. **Single nucleotide variants only** — The current implementation handles SNVs. Insertions, deletions, and structural variants are not yet supported.
2. **Threshold generalization** — The classification threshold was calibrated on BRCA1 variants. Its applicability to other genes should be validated per-gene.
3. **Not a clinical diagnostic tool** — GeneSage provides research-grade predictions. Clinical use would require additional validation and regulatory approval.
4. **Context window** — We use 8,192 bp windows. Some variants may require broader context (Evo2 supports up to 1M bp, but inference time increases substantially).
5. **Model blind spots** — Recent research has noted that DNA language models can sometimes be influenced by irrelevant genomic context or fail to account for gene-specific biology.

---

## 15. References

1. Brixi, G., et al. (2025). "Genome modeling and design across all domains of life with Evo 2." *bioRxiv*, 2025.02.18.638918. [Link](https://www.biorxiv.org/content/10.1101/2025.02.18.638918v1)

2. Findlay, G. M., et al. (2018). "Accurate classification of BRCA1 variants with saturation genome editing." *Nature*, 562, 217–222.

3. Arc Institute — Evo2 GitHub Repository. [Link](https://github.com/ArcInstitute/evo2)

4. OpenGenome2 Dataset — HuggingFace. [Link](https://huggingface.co/datasets/arcinstitute/opengenome2)

5. UCSC Genome Browser REST API. [Link](https://api.genome.ucsc.edu)

6. NCBI E-utilities Documentation. [Link](https://www.ncbi.nlm.nih.gov/books/NBK25501/)

7. ClinVar Database — NCBI. [Link](https://www.ncbi.nlm.nih.gov/clinvar/)
