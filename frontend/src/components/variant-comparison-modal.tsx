import type { ClinvarVariant } from "~/utils/genome-api";
import { Button } from "./ui/button";
import { Check, ExternalLink, Shield, X } from "lucide-react";
import {
  getClassificationColorClasses,
  getNucleotideColorClass,
} from "~/utils/coloring-utils";

export function VariantComparisonModal({
  comparisonVariant,
  onClose,
}: {
  comparisonVariant: ClinvarVariant | null;
  onClose: () => void;
}) {
  if (!comparisonVariant?.evo2Result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="bg-card max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border/70 shadow-2xl shadow-black/30">
        {/* Modal header */}
        <div className="border-border border-b p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground text-lg font-medium">
              Variant Analysis Comparison
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:bg-muted/70 hover:text-foreground h-7 w-7 cursor-pointer p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Modal content */}
        <div className="p-5">
          {comparisonVariant?.evo2Result && (
            <div className="space-y-6">
              <div className="bg-muted/40 border-border rounded-md border p-4">
                <h4 className="text-foreground mb-3 text-sm font-medium">
                  Variant Information
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-muted-foreground w-28 text-xs">
                          Position:
                        </span>
                        <span className="text-xs">
                          {comparisonVariant.location}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-muted-foreground w-28 text-xs">
                          Type:
                        </span>
                        <span className="text-xs">
                          {comparisonVariant.variation_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-muted-foreground w-28 text-xs">
                          Variant:
                        </span>
                        <span className="font-mono text-xs">
                          {(() => {
                            const match =
                              /(\w)>(\w)/.exec(comparisonVariant.title);
                            if (match?.length === 3) {
                              const [_full, ref, alt] = match;
                              return (
                                <>
                                  <span
                                    className={getNucleotideColorClass(ref!)}
                                  >
                                    {ref}
                                  </span>
                                  <span>{">"}</span>
                                  <span
                                    className={getNucleotideColorClass(alt!)}
                                  >
                                    {alt}
                                  </span>
                                </>
                              );
                            }
                            return comparisonVariant.title;
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-muted-foreground w-28 text-xs">
                          ClinVar ID:
                        </span>
                        <a
                          href={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${comparisonVariant.clinvar_id}`}
                          className="text-primary text-xs hover:underline"
                          target="_blank"
                        >
                          {comparisonVariant.clinvar_id}
                        </a>
                        <ExternalLink className="text-primary ml-1 inline-block h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variant results */}
              <div>
                <h4 className="text-foreground mb-3 text-sm font-medium">
                  Analysis Comparison
                </h4>
                <div className="bg-card border-border rounded-md border p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* ClinVar Assesment */}
                    <div className="bg-muted/50 rounded-md p-4">
                      <h5 className="text-foreground mb-2 flex items-center gap-2 text-xs font-medium">
                        <span className="bg-foreground/10 flex h-5 w-5 items-center justify-center rounded-full">
                          <span className="bg-foreground h-3 w-3 rounded-full"></span>
                        </span>
                        ClinVar Assessment
                      </h5>
                      <div className="mt-2">
                        <div
                          className={`w-fit rounded-md px-2 py-1 text-xs font-normal ${getClassificationColorClasses(comparisonVariant.classification)}`}
                        >
                          {comparisonVariant.classification ||
                            "Unknown significance"}
                        </div>
                      </div>
                    </div>

                    {/* Evo2 Prediction */}
                    <div className="bg-muted/50 rounded-md p-4">
                      <h5 className="text-foreground mb-2 flex items-center gap-2 text-xs font-medium">
                        <span className="bg-foreground/10 flex h-5 w-5 items-center justify-center rounded-full">
                          <span className="bg-primary h-3 w-3 rounded-full"></span>
                        </span>
                        Evo2 Prediction
                      </h5>
                      <div className="mt-2">
                        <div
                          className={`flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-normal ${getClassificationColorClasses(comparisonVariant.evo2Result.prediction)}`}
                        >
                          <Shield className="h-3 w-3" />
                          {comparisonVariant.evo2Result.prediction}
                        </div>
                      </div>
                      {/* Delta score */}
                      <div className="mt-3">
                        <div className="text-muted-foreground mb-1 text-xs">
                          Delta Likelihood Score:
                        </div>
                        <div className="text-sm font-medium">
                          {comparisonVariant.evo2Result.delta_score.toFixed(6)}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {comparisonVariant.evo2Result.delta_score < 0
                            ? "Negative score indicates loss of function"
                            : "Positive score indicated gain/neutral function"}
                        </div>
                      </div>
                      {/* Confidence bar */}
                      <div className="mt-3">
                        <div className="text-muted-foreground mb-1 text-xs">
                          Confidence:
                        </div>
                        <div className="bg-muted mt-1 h-2 w-full rounded-full">
                          <div
                            className={`h-2 rounded-full ${comparisonVariant.evo2Result.prediction.includes("pathogenic") ? "bg-red-600" : "bg-green-600"}`}
                            style={{
                              width: `${Math.min(100, comparisonVariant.evo2Result.classification_confidence * 100)}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-muted-foreground mt-1 text-right text-xs">
                          {Math.round(
                            comparisonVariant.evo2Result
                              .classification_confidence * 100,
                          )}
                          %
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assesment Agreement */}
                  <div className="bg-muted/30 mt-4 rounded-md p-3 text-xs leading-relaxed">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full ${comparisonVariant.classification.toLowerCase() === comparisonVariant.evo2Result.prediction.toLowerCase() ? "bg-green-100" : "bg-yellow-100"}`}
                      >
                        {comparisonVariant.classification.toLowerCase() ===
                        comparisonVariant.evo2Result.prediction.toLowerCase() ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <span className="flex h-3 w-3 items-center justify-center text-yellow-600">
                            <p>!</p>
                          </span>
                        )}
                      </span>
                      <span className="text-foreground font-medium">
                        {comparisonVariant.classification.toLowerCase() ===
                        comparisonVariant.evo2Result.prediction.toLowerCase()
                          ? "Evo2 prediction agrees with ClinVar classification"
                          : "Evo2 prediction differs from ClinVar classification"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="bg-muted/30 border-border flex justify-end border-t p-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-foreground hover:bg-muted/70 cursor-pointer border-border bg-background"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
