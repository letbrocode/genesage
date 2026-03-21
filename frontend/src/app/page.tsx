"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import GeneViewer from "~/components/gene-viewer";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ModeToggle } from "~/components/ui/toggle";
import {
  type ChromosomeFromSeach,
  type GeneFromSearch,
  type GenomeAssemblyFromSearch,
  getAvailableGenomes,
  getGenomeChromosomes,
  searchGenes,
} from "~/utils/genome-api";

type Mode = "browse" | "search";

export default function HomePage() {
  const [genomes, setGenomes] = useState<GenomeAssemblyFromSearch[]>([]);
  const [selectedGenome, setSelectedGenome] = useState<string>("hg38");
  const [chromosomes, setChromosomes] = useState<ChromosomeFromSeach[]>([]);
  const [selectedChromosome, setSelectedChromosome] = useState<string>("chr1");
  const [selectedGene, setSelectedGene] = useState<GeneFromSearch | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeneFromSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("search");

  useEffect(() => {
    const fetchGenomes = async () => {
      try {
        setIsLoading(true);
        const data = await getAvailableGenomes();
        if (data.genomes?.Human) {
          setGenomes(data.genomes.Human);
        }
      } catch (_err) {
        setError("Failed to load genome data");
      } finally {
        setIsLoading(false);
      }
    };
    void fetchGenomes();
  }, []);

  useEffect(() => {
    const fetchChromosomes = async () => {
      try {
        setIsLoading(true);
        const data = await getGenomeChromosomes(selectedGenome);
        setChromosomes(data.chromosomes);
        console.log(data.chromosomes);
        if (data.chromosomes.length > 0) {
          setSelectedChromosome(data.chromosomes[0]!.name);
        }
      } catch (_err) {
        setError("Failed to load chromosome data");
      } finally {
        setIsLoading(false);
      }
    };
    void fetchChromosomes();
  }, [selectedGenome]);

  const performGeneSearch = async (
    query: string,
    genome: string,
    filterFn?: (gene: GeneFromSearch) => boolean,
  ) => {
    try {
      setIsLoading(true);
      const data = await searchGenes(query, genome);
      const results = filterFn ? data.results.filter(filterFn) : data.results;

      setSearchResults(results);
    } catch (_err) {
      setError("Faield to search genes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedChromosome || mode !== "browse") return;
    void performGeneSearch(
      selectedChromosome,
      selectedGenome,
      (gene: GeneFromSearch) => gene.chrom === selectedChromosome,
    );
  }, [selectedChromosome, selectedGenome, mode]);

  const handleGenomeChange = (value: string) => {
    setSelectedGenome(value);
    setSearchResults([]);
    setSelectedGene(null);
  };

  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return;

    setSearchResults([]);
    setSelectedGene(null);
    setError(null);

    if (newMode === "browse" && selectedChromosome) {
      void performGeneSearch(
        selectedChromosome,
        selectedGenome,
        (gene: GeneFromSearch) => gene.chrom === selectedChromosome,
      );
    }

    setMode(newMode);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    void performGeneSearch(searchQuery, selectedGenome);
  };

  const loadBRCA1Example = () => {
    setMode("search");
    setSearchQuery("BRCA1");
    void performGeneSearch("BRCA1", selectedGenome);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="bg-primary/15 pointer-events-none absolute top-[-10rem] left-[-8rem] h-72 w-72 rounded-full blur-3xl" />
      <div className="bg-accent/15 pointer-events-none absolute right-[-8rem] bottom-[-8rem] h-72 w-72 rounded-full blur-3xl" />

      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto w-full max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  <span>GENE</span>
                  <span className="text-primary">SAGE</span>
                </h1>
                <div className="bg-primary absolute -bottom-1 left-0 h-[3px] w-16 rounded-full"></div>
              </div>
              <span className="text-muted-foreground hidden text-sm md:block">
                Genome Variant Intelligence
              </span>
            </div>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-6 py-8">
        {selectedGene ? (
          <GeneViewer
            gene={selectedGene}
            genomeId={selectedGenome}
            onClose={() => setSelectedGene(null)}
          />
        ) : (
          <>
            <Card className="mb-6 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card/90 py-0 shadow-lg shadow-black/5 backdrop-blur-sm dark:shadow-black/25">
              <CardHeader className="bg-muted/40 pt-5 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground text-sm font-semibold uppercase tracking-wide">
                    Genome Assembly
                  </CardTitle>
                  <div className="text-muted-foreground text-xs font-medium">
                    Organism: <span className="font-medium">Human</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-4 pb-5">
                <Select
                  value={selectedGenome}
                  onValueChange={handleGenomeChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="border-border/80 bg-background text-foreground focus-visible:ring-ring/40 h-10 w-full rounded-xl">
                    <SelectValue placeholder="Select genome assembly" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card text-foreground">
                    {genomes.map((genome) => (
                      <SelectItem
                        key={genome.id}
                        value={genome.id}
                        className="focus:bg-primary/10"
                      >
                        {genome.id} - {genome.name}
                        {genome.active ? " (active)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedGenome && (
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                    {
                      genomes.find((genome) => genome.id === selectedGenome)
                        ?.sourceName
                    }
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6 gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card/90 py-0 shadow-lg shadow-black/5 backdrop-blur-sm dark:shadow-black/25">
              <CardHeader className="bg-muted/40 pt-5 pb-3">
                <CardTitle className="text-foreground text-sm font-semibold uppercase tracking-wide">
                  Browse
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-5">
                <Tabs
                  value={mode}
                  onValueChange={(value) => switchMode(value as Mode)}
                >
                  <TabsList className="bg-muted mb-4 h-10 rounded-xl p-1">
                    <TabsTrigger
                      className="rounded-lg px-4 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                      value="search"
                    >
                      Search Genes
                    </TabsTrigger>
                    <TabsTrigger
                      className="rounded-lg px-4 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                      value="browse"
                    >
                      Browse Chromosomes
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="search" className="mt-0">
                    <div className="space-y-4">
                      <form
                        onSubmit={handleSearch}
                        className="flex flex-col gap-3 sm:flex-row"
                      >
                        <div className="relative flex-1">
                          <Input
                            type="text"
                            placeholder="Enter gene symbol or name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 rounded-xl border-border/80 bg-background pr-10"
                          />
                          <Button
                            type="submit"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 absolute top-0 right-0 h-full cursor-pointer rounded-l-none rounded-r-xl"
                            size="icon"
                            disabled={isLoading || !searchQuery.trim()}
                          >
                            <Search className="h-4 w-4" />
                            <span className="sr-only">Search</span>
                          </Button>
                        </div>
                      </form>
                      <Button
                        variant="link"
                        className="text-primary hover:text-primary/80 h-auto cursor-pointer p-0 font-medium"
                        onClick={loadBRCA1Example}
                      >
                        Try BRCA1 example
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="browse" className="mt-0">
                    <div className="max-h-[150px] overflow-y-auto pr-1">
                      <div className="flex flex-wrap gap-2">
                        {chromosomes.map((chrom) => (
                          <Button
                            key={chrom.name}
                            variant="outline"
                            size="sm"
                            className={`h-8 cursor-pointer rounded-full border-border/80 px-4 hover:bg-muted hover:text-foreground ${selectedChromosome === chrom.name ? "bg-primary/15 border-primary/40 text-foreground" : ""}`}
                            onClick={() => setSelectedChromosome(chrom.name)}
                          >
                            {chrom.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {isLoading && (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-border/40 border-t-primary"></div>
                  </div>
                )}

                {error && (
                  <div className="bg-destructive/10 text-destructive border-destructive/20 mt-4 rounded-md border p-3 text-sm">
                    {error}
                  </div>
                )}

                {searchResults.length > 0 && !isLoading && (
                  <div className="mt-6">
                    <div className="mb-2">
                      <h4 className="text-muted-foreground text-xs font-normal">
                        {mode === "search" ? (
                          <>
                            Search Results:{" "}
                            <span className="text-foreground font-medium">
                              {searchResults.length} genes
                            </span>
                          </>
                        ) : (
                          <>
                            Genes on {selectedChromosome}:{" "}
                            <span className="text-foreground font-medium">
                              {searchResults.length} found
                            </span>
                          </>
                        )}
                      </h4>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-border/70">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50 hover:bg-muted/70">
                            <TableHead className="text-muted-foreground text-xs font-normal">
                              Symbol
                            </TableHead>
                            <TableHead className="text-muted-foreground text-xs font-normal">
                              Name
                            </TableHead>
                            <TableHead className="text-muted-foreground text-xs font-normal">
                              Location
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {searchResults.map((gene, index) => (
                            <TableRow
                              key={`${gene.symbol}-${index}`}
                              className="hover:bg-muted/50 cursor-pointer border-b border-border/70"
                              onClick={() => setSelectedGene(gene)}
                            >
                              <TableCell className="text-foreground py-2 font-medium">
                                {gene.symbol}
                              </TableCell>
                              <TableCell className="text-foreground py-2 font-medium">
                                {gene.name}
                              </TableCell>
                              <TableCell className="text-foreground py-2 font-medium">
                                {gene.chrom}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {!isLoading && !error && searchResults.length === 0 && (
                  <div className="text-muted-foreground flex h-48 flex-col items-center justify-center text-center">
                    <Search className="text-muted-foreground/70 mb-4 h-10 w-10" />
                    <p className="text-sm leading-relaxed">
                      {mode === "search"
                        ? "Enter a gene or symbol and click search"
                        : selectedChromosome
                          ? "No genes found on this chromosome"
                          : "Select a chromosome to view genes"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
