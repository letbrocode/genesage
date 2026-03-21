import type {
  GeneBounds,
  GeneDetailsFromSearch,
  GeneFromSearch,
} from "~/utils/genome-api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ExternalLink } from "lucide-react";

export function GeneInformation({
  gene,
  geneDetail,
  geneBounds,
}: {
  gene: GeneFromSearch;
  geneDetail: GeneDetailsFromSearch | null;
  geneBounds: GeneBounds | null;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card/90 py-0 shadow-lg shadow-black/5 backdrop-blur-sm dark:shadow-black/25">
      <CardHeader className="bg-muted/40 pt-5 pb-3">
        <CardTitle className="text-foreground text-sm font-semibold uppercase tracking-wide">
          Gene Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex">
              <span className="text-muted-foreground min-28 w-28 text-xs">
                Symbol:
              </span>
              <span className="text-xs">{gene.symbol}</span>
            </div>
            <div className="flex">
              <span className="text-muted-foreground min-28 w-28 text-xs">
                Name:
              </span>
              <span className="text-xs">{gene.name}</span>
            </div>
            {gene.description && gene.description !== gene.name && (
              <div className="flex">
                <span className="text-muted-foreground min-28 w-28 text-xs">
                  Description:
                </span>
                <span className="text-xs">{gene.description}</span>
              </div>
            )}
            <div className="flex">
              <span className="text-muted-foreground min-28 w-28 text-xs">
                Chromosome:
              </span>
              <span className="text-xs">{gene.chrom}</span>
            </div>
            {geneBounds && (
              <div className="flex">
                <span className="text-muted-foreground min-28 w-28 text-xs">
                  Position:
                </span>
                <span className="text-xs">
                  {Math.min(geneBounds.min, geneBounds.max).toLocaleString()} -{" "}
                  {Math.max(geneBounds.min, geneBounds.max).toLocaleString()} (
                  {Math.abs(
                    geneBounds.max - geneBounds.min + 1,
                  ).toLocaleString()}{" "}
                  bp)
                  {geneDetail?.genomicinfo?.[0]?.strand === "-" &&
                    " (reverse strand)"}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {gene.gene_id && (
              <div className="flex">
                <span className="text-muted-foreground min-28 w-28 text-xs">
                  Gene ID:
                </span>
                <span className="text-xs">
                  <a
                    href={`https://www.ncbi.nlm.nih.gov/gene/${gene.gene_id}`}
                    target="_blank"
                    className="text-primary flex items-center hover:underline"
                  >
                    {gene.gene_id}
                    <ExternalLink className="ml-1 inline-block h-3 w-3" />
                  </a>
                </span>
              </div>
            )}
            {geneDetail?.organism && (
              <div className="flex">
                <span className="text-muted-foreground w-28 text-xs">
                  Organism:
                </span>
                <span className="text-xs">
                  {geneDetail.organism.scientificname}{" "}
                  {geneDetail.organism.commonname &&
                    ` (${geneDetail.organism.commonname})`}
                </span>
              </div>
            )}

            {geneDetail?.summary && (
              <div className="mt-4">
                <h3 className="text-foreground mb-2 text-xs font-medium">
                  Summary:
                </h3>
                <p className="text-foreground/80 text-xs leading-relaxed">
                  {geneDetail.summary}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
