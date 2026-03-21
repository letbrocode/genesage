"use client";

import {
  analyzeVariantWithAPI,
  type ClinvarVariant,
  type GeneFromSearch,
} from "~/utils/genome-api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

import {
  BarChart2,
  ExternalLink,
  RefreshCw,
  Search,
  Shield,
  Zap,
} from "lucide-react";
import { getClassificationColorClasses } from "~/utils/coloring-utils";

export default function KnownVariants({
  refreshVariants,
  showComparison,
  updateClinvarVariant,
  clinvarVariants,
  isLoadingClinvar,
  clinvarError,
  genomeId,
  gene,
}: {
  refreshVariants: () => void;
  showComparison: (variant: ClinvarVariant) => void;
  updateClinvarVariant: (id: string, newVariant: ClinvarVariant) => void;
  clinvarVariants: ClinvarVariant[];
  isLoadingClinvar: boolean;
  clinvarError: string | null;
  genomeId: string;
  gene: GeneFromSearch;
}) {
  const analyzeVariant = async (variant: ClinvarVariant) => {
    let variantDetails = null;
    const position = variant.location
      ? parseInt(variant.location.replaceAll(",", ""))
      : null;

    const refAltMatch = /(\w)>(\w)/.exec(variant.title);

    if (refAltMatch && refAltMatch.length === 3) {
      variantDetails = {
        position,
        reference: refAltMatch[1],
        alternative: refAltMatch[2],
      };
    }

    if (
      !variantDetails?.position ||
      !variantDetails?.reference ||
      !variantDetails?.alternative
    ) {
      return;
    }

    updateClinvarVariant(variant.clinvar_id, {
      ...variant,
      isAnalyzing: true,
    });

    try {
      const data = await analyzeVariantWithAPI({
        position: variantDetails.position,
        alternative: variantDetails.alternative,
        genomeId: genomeId,
        chromosome: gene.chrom,
      });

      const updatedVariant: ClinvarVariant = {
        ...variant,
        isAnalyzing: false,
        evo2Result: data,
      };

      updateClinvarVariant(variant.clinvar_id, updatedVariant);

      showComparison(updatedVariant);
    } catch (error) {
      updateClinvarVariant(variant.clinvar_id, {
        ...variant,
        isAnalyzing: false,
        evo2Error: error instanceof Error ? error.message : "Analysis failed",
      });
    }
  };
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-2 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card/90 py-0 shadow-lg shadow-black/5 backdrop-blur-sm duration-300 dark:shadow-black/25">
      <CardHeader className="bg-muted/40 flex flex-row items-center justify-between pt-5 pb-3">
        <CardTitle className="text-foreground text-sm font-semibold uppercase tracking-wide">
          Known Variants in Gene from ClinVar
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshVariants}
          disabled={isLoadingClinvar}
          className="text-foreground hover:bg-muted/70 h-8 cursor-pointer rounded-full px-3 text-xs transition-colors duration-200"
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="pt-4 pb-5">
        {clinvarError && (
          <div className="bg-destructive/10 text-destructive mb-4 rounded-md p-3 text-xs">
            {clinvarError}
          </div>
        )}

        {isLoadingClinvar ? (
          <div className="flex justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-border/40 border-t-primary"></div>
          </div>
        ) : clinvarVariants.length > 0 ? (
          <div className="border-border/70 h-96 max-h-96 overflow-y-scroll rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="bg-muted/80 hover:bg-muted/40">
                  <TableHead className="text-foreground py-2 text-xs font-medium">
                    Variant
                  </TableHead>
                  <TableHead className="text-foreground py-2 text-xs font-medium">
                    Type
                  </TableHead>
                  <TableHead className="text-foreground py-2 text-xs font-medium">
                    Clinical Significance
                  </TableHead>
                  <TableHead className="text-foreground py-2 text-xs font-medium">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinvarVariants.map((variant) => (
                  <TableRow
                    key={variant.clinvar_id}
                    className="border-border/70 border-b transition-colors duration-200 hover:bg-muted/40"
                  >
                    <TableCell className="py-2">
                      <div className="text-foreground text-xs font-medium">
                        {variant.title}
                      </div>
                      <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                        <p>Location: {variant.location}</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-primary hover:text-primary/80 h-6 cursor-pointer px-0 text-xs"
                          onClick={() =>
                            window.open(
                              `https://www.ncbi.nlm.nih.gov/clinvar/variation/${variant.clinvar_id}`,
                              "_blank",
                            )
                          }
                        >
                          View in ClinVar
                          <ExternalLink className="ml-1 inline-block h-2 w-2" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-xs">
                      {variant.variation_type}
                    </TableCell>
                    <TableCell className="py-2 text-xs">
                      <div
                        className={`w-fit rounded-md px-2 py-1 text-center font-normal ${getClassificationColorClasses(variant.classification)}`}
                      >
                        {variant.classification || "Unknown"}
                      </div>
                      {variant.evo2Result && (
                        <div className="mt-2">
                          <div
                            className={`flex w-fit items-center gap-1 rounded-md px-2 py-1 text-center ${getClassificationColorClasses(variant.evo2Result.prediction)}`}
                          >
                            <Shield className="h-3 w-3" />
                            <span>Evo2: {variant.evo2Result.prediction}</span>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-2 text-xs">
                      <div className="flex flex-col items-end gap-1">
                        {variant.variation_type
                          .toLowerCase()
                          .includes("single nucleotide") ? (
                          !variant.evo2Result ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-muted text-foreground hover:bg-muted/80 h-7 cursor-pointer border-border/80 px-3 text-xs transition-colors duration-200"
                              disabled={variant.isAnalyzing}
                              onClick={() => analyzeVariant(variant)}
                            >
                              {variant.isAnalyzing ? (
                                <>
                                  <span className="mr-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-border/40 border-t-primary"></span>
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  <Zap className="mr-1 inline-block h-3 w-3" />
                                  Analyze with Evo2
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 cursor-pointer border-green-300/70 bg-green-100/70 px-3 text-xs text-green-800 transition-colors duration-200 hover:bg-green-100"
                              onClick={() => showComparison(variant)}
                            >
                              <BarChart2 className="mr-1 inline-block h-3 w-3" />
                              Compare Results
                            </Button>
                          )
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-muted-foreground flex h-48 flex-col items-center justify-center text-center">
            <Search className="text-muted-foreground/70 mb-4 h-10 w-10" />
            <p className="text-sm leading-relaxed">
              No ClinVar variants found for this gene.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
