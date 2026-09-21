export type ArtefactKind = "chart" | "headline" | "survey";

/**
 * A flat shape on purpose: this is what the generator must produce, and Gemini's
 * structured output is far more reliable with every field always present than
 * with a discriminated union. Unused fields are empty rather than absent.
 */
export type Artefact = {
  kind: ArtefactKind;
  title: string;
  source: string;
  bars: { label: string; value: number }[];
  axisStart: number;
  unit: string;
  standfirst: string;
  body: string;
  options: string[];
};

export const EMPTY_ARTEFACT: Omit<Artefact, "kind" | "title" | "source"> = {
  bars: [],
  axisStart: 0,
  unit: "",
  standfirst: "",
  body: "",
  options: [],
};
